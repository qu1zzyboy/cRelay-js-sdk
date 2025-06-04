import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

interface Field {
  name: string
  type: string
  tag: string
  required: boolean
  multiple?: boolean
}

interface Event {
  name: string
  operation: string
  kind: number
  description: string
  fields: Field[]
}

interface CIPDefinition {
  name: string
  package: string
  description: string
  events: Event[]
}

function generateConstants(cip: CIPDefinition): { kinds: string; ops: string; lists: string } {
  const kinds: string[] = []
  const ops: string[] = []
  const lists: string[] = []

  // Add CIP name comment before new constants
  const cipComment = `// ${cip.name}`

  // Add kind constants
  kinds.push(cipComment + ` event kinds`)
  cip.events.forEach(event => {
    kinds.push(`export const Kind${event.name} = ${event.kind}`)
  })

  // Add operation constants
  ops.push(cipComment + ` operation types`)
  cip.events.forEach(event => {
    ops.push(
      `export const Op${event.operation.charAt(0).toUpperCase() + event.operation.slice(1)} = '${event.operation}'`,
    )
  })

  // Add subspace ops string
  lists.push(cipComment + ` operations string`)
  const opsString = cip.events.map(event => `${event.operation}=${event.kind}`).join(',')
  lists.push(`export const ${cip.name.charAt(0).toUpperCase() + cip.name.slice(1)}SubspaceOps = '${opsString}'`)

  return {
    kinds: kinds.join('\n'),
    ops: ops.join('\n'),
    lists: lists.join('\n'),
  }
}

function generateEventClass(event: Event): string {
  const className = event.name
  const fields = event.fields
    .map(field => {
      const type = field.multiple ? `${field.type}[]` : field.type
      return `  ${field.name}: ${type}`
    })
    .join('\n')

  const constructor = event.fields
    .map(field => {
      const defaultValue = field.multiple ? '[]' : field.type === 'string' ? "''" : '0'
      return `    this.${field.name} = ${defaultValue}`
    })
    .join('\n')

  const methods = event.fields
    .map(field => {
      if (field.multiple) {
        return `
  // Add${field.name} adds a ${field.name.toLowerCase()} to the event
  add${field.name}(${field.name.toLowerCase()}: ${field.type}) {
    this.${field.name}.push(${field.name.toLowerCase()})
    this.SubspaceOpEvent.tags.push(['${field.tag}', ${field.name.toLowerCase()}])
  }`
      } else {
        return `
  // Set${field.name} sets the ${field.name.toLowerCase()}
  set${field.name}(${field.name.toLowerCase()}: ${field.type}) {
    this.${field.name} = ${field.name.toLowerCase()}
    this.SubspaceOpEvent.tags.push(['${field.tag}', ${field.name.toLowerCase()}])
  }`
      }
    })
    .join('\n')

  return `
// ${event.name} represents a ${event.operation} operation in ${event.description.toLowerCase()}
class ${className} {
  SubspaceOpEvent: SubspaceOpEvent
${fields}

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
${constructor}
  }
${methods}
}`
}

function generateParseFunction(event: Event): string {
  const className = event.name
  const kindConstant = `Kind${event.name}`
  const opConstant = `Op${event.operation.charAt(0).toUpperCase() + event.operation.slice(1)}`

  const fieldCases = event.fields
    .map(field => {
      if (field.multiple) {
        return `      case '${field.tag}':
        ${className.toLowerCase()}.${field.name}.push(tag[1])
        break`
      } else {
        return `      case '${field.tag}':
        ${className.toLowerCase()}.${field.name} = tag[1]
        break`
      }
    })
    .join('\n')

  return `
function parse${className}(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, ${kindConstant}, evt.content)
  const ${className.toLowerCase()} = new ${className}(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
${fieldCases}
    }
  }

  return [${className.toLowerCase()}.SubspaceOpEvent, null]
}`
}

function generateNewEventFunction(event: Event): string {
  const className = event.name
  const kindConstant = `Kind${event.name}`

  return `
// New${className} creates a new ${event.operation} event
export async function new${className}(subspaceID: string, content: string): Promise<${className} | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, ${kindConstant}, content)
  return new ${className}(baseEvent)
}`
}

function generateCode(cip: CIPDefinition): string {
  const imports = `import { SubspaceOpEvent, NostrEvent, Tags, NewSubspaceOpEvent, setParents } from '../subspace.ts'
import { getOpFromKind } from '../keys.ts'
import { AuthTag } from '../auth.ts'
import {
${cip.events
  .map(
    event => `  Kind${event.name},
  Op${event.operation.charAt(0).toUpperCase() + event.operation.slice(1)}`,
  )
  .join(',\n')}
} from '../constants.ts'`

  const eventClasses = cip.events.map(generateEventClass).join('\n')

  const toNostrEvent = `
// Function to convert Subspace events to Nostr Event
export function toNostrEvent(event: ${cip.events.map(e => e.name).join(' | ')}): NostrEvent {
  const tags: Tags = event.SubspaceOpEvent.tags

  return {
    created_at: event.SubspaceOpEvent.createdAt,
    kind: event.SubspaceOpEvent.kind,
    tags,
    content: event.SubspaceOpEvent.content,
  }
}`

  const parseEvent = `
// Parse${cip.name.charAt(0).toUpperCase() + cip.name.slice(1)}Event parses a Nostr event into a ${cip.name} event
function parse${cip.name.charAt(0).toUpperCase() + cip.name.slice(1)}Event(evt: NostrEvent): [SubspaceOpEvent | null, Error | null] {
  let subspaceID = ''
  let authTag: AuthTag | undefined
  let parentHash: string[] = []

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'sid':
        subspaceID = tag[1]
        break
      case 'auth':
        try {
          authTag = AuthTag.parseAuthTag(tag[1])
        } catch (err) {
          return [null, new Error(\`failed to parse auth tag: \${err}\`)]
        }
        break
      case 'parent':
        parentHash = tag.slice(1)
    }
  }

  // Get operation from kind
  const [operation, exists] = getOpFromKind(evt.kind)
  if (!exists) {
    return [null, new Error(\`unknown kind value: \${evt.kind}\`)]
  }

  // Parse based on operation type
  switch (operation) {
${cip.events
  .map(
    event => `    case Op${event.operation.charAt(0).toUpperCase() + event.operation.slice(1)}:
      return parse${event.name}(evt, subspaceID, operation, authTag, parentHash)`,
  )
  .join('\n')}
    default:
      return [null, new Error(\`unknown operation type: \${operation}\`)]
  }
}`

  const parseFunctions = cip.events.map(generateParseFunction).join('\n')
  const newEventFunctions = cip.events.map(generateNewEventFunction).join('\n')

  return `${imports}

${eventClasses}

${toNostrEvent}

${parseEvent}

${parseFunctions}

${newEventFunctions}`
}

function updateConstantsFile(cip: CIPDefinition) {
  const constantsFile = join(dirname(fileURLToPath(import.meta.url)), '..', 'constants.ts')
  const constantsContent = readFileSync(constantsFile, 'utf-8')

  // Generate new constants
  const { kinds, ops, lists } = generateConstants(cip)

  // Find section markers
  const kindsMarker = '// * Event kinds'
  const opsMarker = '// * Event operations'
  const listsMarker = '// * CIP operation lists'

  // Split content into sections
  const sections = constantsContent.split(/(?=^\/\/ \* )/m)
  let updatedContent = ''

  for (const section of sections) {
    if (section.startsWith(kindsMarker)) {
      updatedContent += section.trimEnd() + '\n\n' + kinds + '\n\n'
    } else if (section.startsWith(opsMarker)) {
      updatedContent += section.trimEnd() + '\n\n' + ops + '\n\n'
    } else if (section.startsWith(listsMarker)) {
      updatedContent += section.trimEnd() + '\n\n' + lists + '\n\n'
    } else {
      updatedContent += section
    }
  }

  writeFileSync(constantsFile, updatedContent)
}

function updateKeysFile(cip: CIPDefinition) {
  const keysFile = join(dirname(fileURLToPath(import.meta.url)), '..', 'keys.ts')
  const keysContent = readFileSync(keysFile, 'utf-8')

  // Use CIP name as the comment for all new mappings
  const cipComment = `// ${cip.name.charAt(0).toUpperCase() + cip.name.slice(1)} operations`
  let commentInserted = false
  const newMappings = cip.events
    .map(event => {
      let comment = ''
      if (!commentInserted) {
        comment = `\n\n ${cipComment}` // Add a blank line before the comment
        commentInserted = true
      }
      return `${comment}\n  [constants.Kind${event.name}]: constants.Op${event.operation.charAt(0).toUpperCase() + event.operation.slice(1)},`
    })
    .join('')

  // Find the KeyOpMap declaration
  const mapDecl = 'export const KeyOpMap:'
  const mapDeclIdx = keysContent.indexOf(mapDecl)
  if (mapDeclIdx === -1) throw new Error('Could not find KeyOpMap in keys.ts')

  // Find the '=' after the declaration
  const eqIdx = keysContent.indexOf('=', mapDeclIdx)
  if (eqIdx === -1) throw new Error('Could not find = for KeyOpMap in keys.ts')

  // Find the first '{' after '=' (this is the start of the object literal)
  const objStart = keysContent.indexOf('{', eqIdx)
  if (objStart === -1) throw new Error('Could not find opening { for KeyOpMap object in keys.ts')

  // Find the matching closing '}' for the object literal
  let braceCount = 0,
    objEnd = -1
  for (let i = objStart; i < keysContent.length; i++) {
    if (keysContent[i] === '{') braceCount++
    if (keysContent[i] === '}') braceCount--
    if (braceCount === 0) {
      objEnd = i
      break
    }
  }
  if (objEnd === -1) throw new Error('Could not find closing } for KeyOpMap object in keys.ts')

  // Insert new mappings before the closing brace of the object
  const before = keysContent.slice(0, objEnd)
  const after = keysContent.slice(objEnd)
  // Avoid duplicate insertions by checking if the mapping already exists
  const alreadyExists = (line: string) => before.includes(line.trim())
  // Only insert lines that do not already exist
  const filteredMappings = newMappings
    .split('\n')
    .filter(line => line.trim() && !alreadyExists(line))
    .join('\n')
  // Insert a newline and a space before the new mappings for style
  // Ensure a newline after the last mapping and before the closing brace
  const updatedContent =
    before.replace(/\s*$/, '') + '\n' +
    (filteredMappings ? '\n ' : '') +
    filteredMappings +
    (filteredMappings ? '\n' : '') +
    after.replace(/^}/, '\n}')

  writeFileSync(keysFile, updatedContent)
}

async function main() {
  const args = process.argv.slice(2)
  if (args.length !== 1) {
    console.error('Usage: tsx generate-cip.ts <json-file>')
    process.exit(1)
  }

  const jsonFile = args[0]
  const cip = JSON.parse(readFileSync(jsonFile, 'utf-8')) as CIPDefinition

  // Create package directory if it doesn't exist
  const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..', cip.package)
  try {
    mkdirSync(packageDir, { recursive: true })
  } catch (err: any) {
    if (err.code !== 'EEXIST') {
      throw err
    }
  }

  // Update constants.ts and keys.ts
  updateConstantsFile(cip)
  updateKeysFile(cip)

  // Generate the TypeScript code
  const code = generateCode(cip)

  // Write the generated code to a file
  const outputFile = join(packageDir, `${cip.name}.ts`)
  writeFileSync(outputFile, code)

  console.log(`Generated ${outputFile}`)
  console.log('Updated constants.ts and keys.ts')
}

main().catch(console.error)

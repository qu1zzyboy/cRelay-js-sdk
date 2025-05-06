import crypto from 'crypto'
import { AuthTag } from './auth.ts'
import { getOpFromKind } from './keys.ts'
import * as constants from './constants.ts'

// Tag type definition
export type Tag = string[]
export type Tags = Tag[]

// Nostr Event interface
export interface NostrEvent {
  id?: string
  pubkey?: string
  created_at: number
  kind: number
  tags: Tags
  content: string
  sig?: string
}

// SubspaceCreateEvent
export interface SubspaceCreateEvent {
  kind: number
  createdAt: number
  subspaceID: string
  subspaceName: string
  ops: string
  rules: string
  description: string
  imageURL: string
  tags: Tag[]
  content: string
}

// SubspaceJoinEvent
export interface SubspaceJoinEvent {
  kind: number
  createdAt: number
  subspaceID: string
  tags: Tag[]
  content: string
}

// SubspaceOpEvent
export interface SubspaceOpEvent {
  kind: number
  createdAt: number
  subspaceID: string
  operation: string
  tags: Tag[]
  content: string
  authTag?: AuthTag
  parents?: string[]
}

export function getSubspaceID(event: SubspaceOpEvent): string {
  return event.subspaceID
}

export function getOperation(event: SubspaceOpEvent): string {
  return event.operation
}

export function getAuthTag(event: SubspaceOpEvent): AuthTag | undefined {
  return event.authTag
}

export function setAuth(event: SubspaceOpEvent, actionStr: string): void {
  const authTag = AuthTag.parseAuthTag(actionStr)
  event.authTag = authTag
  let tag: Tag = ["auth", authTag.toString()]
  event.tags.push(tag)
}

export function setParents(event: SubspaceOpEvent, parentHashSet: string[]): void {
  let validParents: string[] = [];
  for (const parent of parentHashSet) {
    if (parent.length === 64) {
      validParents.push(parent);
    }
  }
  event.parents = validParents;
  let tag: Tag = ["parent", ...validParents]
  event.tags.push(tag)
}

export function validateAuthTag(authTag: AuthTag): boolean {
  if (!authTag.Action || !authTag.Key || !authTag.Exp) {
    return false
  }
  return true
}

// Helper function to calculate SHA256 hash
function calculateSHA256(input: string): string {
  const hash = crypto.createHash('sha256').update(input).digest('hex')
  return `0x${hash}`
}

// Function to convert Subspace events to Nostr Event
export function toNostrEvent(event: SubspaceCreateEvent | SubspaceJoinEvent): NostrEvent {
  const tags: Tags = event.tags.map(tag => tag)

  return {
    created_at: event.createdAt,
    kind: event.kind,
    tags,
    content: event.content,
  }
}

// Example usage for SubspaceCreateEvent
export function NewSubspaceCreateEvent(
  subspaceName: string,
  ops: string,
  rules: string,
  description: string,
  imageURL: string,
): SubspaceCreateEvent {
  const subspaceID = calculateSHA256(subspaceName + ops + rules)
  const tags: Tag[] = [
    ['d', 'subspace_create'],
    ['sid', subspaceID],
    ['subspace_name', subspaceName],
    ['ops', ops],
  ]
  if (rules) {
    tags.push(['rules', rules])
  }

  const content = JSON.stringify({
    desc: description,
    img_url: imageURL,
  })

  return {
    kind: constants.KindSubspaceCreate, // Use imported constant
    createdAt: Math.floor(Date.now() / 1000),
    subspaceID,
    subspaceName,
    ops,
    rules,
    description,
    imageURL,
    tags,
    content,
  }
}

// Example usage for SubspaceJoinEvent
export function NewSubspaceJoinEvent(subspaceID: string, content: string): SubspaceJoinEvent {
  const tags: Tag[] = [
    ['d', 'subspace_join'],
    ['sid', subspaceID],
  ]

  return {
    kind: constants.KindSubspaceJoin,
    createdAt: Math.floor(Date.now() / 1000),
    subspaceID,
    tags,
    content,
  }
}

// Example usage for SubspaceOpEvent
export function NewSubspaceOpEvent(subspaceID: string, kind: number, content: string): SubspaceOpEvent {
  let operation = getOpFromKind(kind)
  if (operation[0] == undefined) {
    operation[0] = ''
  }
  let op = operation[0]

  const tags: Tag[] = [
    ['d', 'subspace_op'],
    ['sid', subspaceID],
    ['ops', operation[0]],
  ]

  return {
    kind: kind,
    createdAt: Math.floor(Date.now() / 1000),
    subspaceID,
    operation: op,
    tags,
    content,
  }
}

// calculateSubspaceID generates a unique subspace ID based on subspaceName, ops, and rules
export function calculateSubspaceID(subspaceName: string, ops: string, rules: string): string {
  const input = subspaceName + ops + rules
  return calculateSHA256(input)
}

// ops Verification Logic
export function ValidateSubspaceCreateEvent(event: SubspaceCreateEvent): void {
  if (event.kind !== constants.KindSubspaceCreate) {
    // Use imported constant
    throw new Error(`Invalid event kind: expected ${constants.KindSubspaceCreate}, got ${event.kind}`)
  }

  const requiredTags = ['d', 'sid', 'subspace_name', 'ops']
  const tagKeys = event.tags.map(tag => tag[0])

  for (const tag of requiredTags) {
    if (!tagKeys.includes(tag)) {
      throw new Error(`Missing required tag: ${tag}. Ensure the tag is included in the event.`)
    }
  }

  const calculatedSID = calculateSubspaceID(event.subspaceName, event.ops, event.rules)
  if (event.subspaceID !== calculatedSID) {
    throw new Error(`Invalid subspace ID: expected ${calculatedSID}, got ${event.subspaceID}`)
  }

  const content = JSON.parse(event.content)
  if (!content.desc) {
    throw new Error('Missing description in content')
  }

  const opsParts = event.ops.split(',')
  for (const part of opsParts) {
    const [key, value] = part.split('=')
    if (!key || !value || isNaN(Number(value))) {
      throw new Error(`Invalid ops format: ${event.ops}. Each part must be in the format key=value.`)
    }
  }
}

// ValidateSubspaceJoinEvent validates a SubspaceJoinEvent
export function ValidateSubspaceJoinEvent(event: SubspaceJoinEvent): void {
  if (event.kind !== constants.KindSubspaceJoin) {
    throw new Error(`Invalid event kind: expected ${constants.KindSubspaceJoin}, got ${event.kind}`)
  }

  const requiredTags = ['d', 'sid']
  const tagKeys = event.tags.map(tag => tag[0])

  for (const tag of requiredTags) {
    if (!tagKeys.includes(tag)) {
      throw new Error(`Missing required tag: ${tag}`)
    }
  }

  if (!event.subspaceID.startsWith('0x') || event.subspaceID.length !== 66) {
    throw new Error('Invalid subspace ID format or length')
  }
}

// ParseSubspaceCreateEvent parses a raw NostrEvent into a SubspaceCreateEvent
export function ParseSubspaceCreateEvent(rawEvent: NostrEvent): SubspaceCreateEvent {
  const subspaceEvent: SubspaceCreateEvent = {
    kind: rawEvent.kind,
    createdAt: rawEvent.created_at,
    subspaceID: '',
    subspaceName: '',
    ops: '',
    rules: '',
    description: '',
    imageURL: '',
    tags: rawEvent.tags,
    content: rawEvent.content,
  }

  // Extract fields from tags
  for (const tag of rawEvent.tags) {
    const [key, value] = tag
    switch (key) {
      case 'sid':
        subspaceEvent.subspaceID = value
        break
      case 'subspace_name':
        subspaceEvent.subspaceName = value
        break
      case 'ops':
        subspaceEvent.ops = value
        break
      case 'rules':
        subspaceEvent.rules = value
        break
    }
  }

  // Parse content
  const content = JSON.parse(rawEvent.content)
  subspaceEvent.description = content.desc || ''
  subspaceEvent.imageURL = content.img_url || ''

  // Validate the parsed event
  ValidateSubspaceCreateEvent(subspaceEvent)

  return subspaceEvent
}

// ParseSubspaceJoinEvent parses a raw NostrEvent into a SubspaceJoinEvent
export function ParseSubspaceJoinEvent(rawEvent: NostrEvent): SubspaceJoinEvent {
  const joinEvent: SubspaceJoinEvent = {
    kind: rawEvent.kind,
    createdAt: rawEvent.created_at,
    subspaceID: '',
    tags: rawEvent.tags,
    content: rawEvent.content,
  }

  // Extract fields from tags
  for (const tag of rawEvent.tags) {
    const [key, value] = tag
    if (key === 'sid') {
      joinEvent.subspaceID = value
    }
  }

  // Validate the parsed event
  ValidateSubspaceJoinEvent(joinEvent)

  return joinEvent
}

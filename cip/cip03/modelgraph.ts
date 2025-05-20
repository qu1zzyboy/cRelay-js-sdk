import { SubspaceOpEvent, NostrEvent, Tags, NewSubspaceOpEvent, setParents } from '../subspace.ts'
import { getOpFromKind } from '../keys.ts'
import { AuthTag } from '../auth.ts'
import {
  KindModelgraphModel,
  KindModelgraphDataset,
  KindModelgraphCompute,
  KindModelgraphAlgo,
  KindModelgraphValid,
  KindModelgraphFinetune,
  KindModelgraphConversation,
  KindModelgraphSession,
  OpModel,
  OpDataset,
  OpCompute,
  OpAlgo,
  OpValid,
  OpFinetune,
  OpConversation,
  OpSession,
} from '../constants.ts'

// ModelEvent represents a model operation in modelgraph subspace
class ModelEvent {
  SubspaceOpEvent: SubspaceOpEvent
  ParentHash: string
  Contributions: string
  Content: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.ParentHash = ''
    this.Contributions = ''
    this.Content = ''
  }

  // SetContributions sets the contribution weights
  setContributions(contributions: string) {
    this.Contributions = contributions
    this.SubspaceOpEvent.tags.push(['contrib', contributions])
  }

  // SetParent sets the parent event hash
  setParent(parentHash: string) {
    this.ParentHash = parentHash
    this.SubspaceOpEvent.tags.push(['parent', parentHash])
  }
}

// ComputeEvent represents a compute operation in modelgraph subspace
class ComputeEvent {
  SubspaceOpEvent: SubspaceOpEvent
  ComputeType: string
  Content: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.ComputeType = ''
    this.Content = ''
  }

  // SetComputeType sets the compute type
  setComputeType(computeType: string) {
    this.ComputeType = computeType
    this.SubspaceOpEvent.tags.push(['compute_type', computeType])
  }
}

// AlgoEvent represents an algo operation in modelgraph subspace
class AlgoEvent {
  SubspaceOpEvent: SubspaceOpEvent
  AlgoType: string
  Content: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.AlgoType = ''
    this.Content = ''
  }

  // SetAlgoType sets the algorithm type
  setAlgoType(algoType: string) {
    this.AlgoType = algoType
    this.SubspaceOpEvent.tags.push(['algo_type', algoType])
  }
}

// ValidEvent represents a valid operation in modelgraph subspace
class ValidEvent {
  SubspaceOpEvent: SubspaceOpEvent
  ValidResult: string
  Content: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.ValidResult = ''
    this.Content = ''
  }

  // SetValidResult sets the validation result
  setValidResult(validResult: string) {
    this.ValidResult = validResult
    this.SubspaceOpEvent.tags.push(['valid_result', validResult])
  }
}

// DatasetEvent represents a dataset operation in modelgraph subspace
class DatasetEvent {
  SubspaceOpEvent: SubspaceOpEvent
  ProjectID: string
  TaskID: string
  Category: string
  Format: string
  Contributors: string[]
  Content: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.ProjectID = ''
    this.TaskID = ''
    this.Category = ''
    this.Format = ''
    this.Contributors = []
    this.Content = ''
  }

  // SetDatasetInfo sets the dataset information
  setDatasetInfo(projectID: string, taskID: string, category: string, format: string, contributors: string[]) {
    this.ProjectID = projectID
    this.TaskID = taskID
    this.Category = category
    this.Format = format
    this.Contributors = contributors

    this.SubspaceOpEvent.tags.push(
      ['project_id', projectID],
      ['task_id', taskID],
      ['category', category],
      ['format', format],
    )

    if (contributors.length > 0) {
      this.SubspaceOpEvent.tags.push(['contributors', ...contributors])
    }
  }
}

// FinetuneEvent represents a finetune operation in modelgraph subspace
class FinetuneEvent {
  SubspaceOpEvent: SubspaceOpEvent
  ProjectID: string
  TaskID: string
  DatasetID: string
  ProviderID: string
  ModelName: string
  Content: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.ProjectID = ''
    this.TaskID = ''
    this.DatasetID = ''
    this.ProviderID = ''
    this.ModelName = ''
    this.Content = ''
  }

  // SetFinetuneInfo sets the finetune information
  setFinetuneInfo(projectID: string, taskID: string, datasetID: string, providerID: string, modelName: string) {
    this.ProjectID = projectID
    this.TaskID = taskID
    this.DatasetID = datasetID
    this.ProviderID = providerID
    this.ModelName = modelName

    this.SubspaceOpEvent.tags.push(
      ['project_id', projectID],
      ['task_id', taskID],
      ['dataset_id', datasetID],
      ['provider_id', providerID],
      ['model_name', modelName],
    )
  }
}

// ConversationEvent represents a conversation operation in modelgraph subspace
class ConversationEvent {
  SubspaceOpEvent: SubspaceOpEvent
  SessionID: string
  UserID: string
  ModelID: string
  Timestamp: string
  InteractionHash: string
  Content: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.SessionID = ''
    this.UserID = ''
    this.ModelID = ''
    this.Timestamp = ''
    this.InteractionHash = ''
    this.Content = ''
  }

  // SetConversationInfo sets the conversation information
  setConversationInfo(sessionID: string, userID: string, modelID: string, timestamp: string, interactionHash: string) {
    this.SessionID = sessionID
    this.UserID = userID
    this.ModelID = modelID
    this.Timestamp = timestamp
    this.InteractionHash = interactionHash

    this.SubspaceOpEvent.tags.push(
      ['session_id', sessionID],
      ['user_id', userID],
      ['model_id', modelID],
      ['timestamp', timestamp],
      ['interaction_hash', interactionHash],
    )
  }
}

// SessionEvent represents a session operation in modelgraph subspace
class SessionEvent {
  SubspaceOpEvent: SubspaceOpEvent
  SessionID: string
  Action: string
  UserID: string
  StartTime: string
  EndTime: string
  Content: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.SessionID = ''
    this.Action = ''
    this.UserID = ''
    this.StartTime = ''
    this.EndTime = ''
    this.Content = ''
  }

  // SetSessionInfo sets the session information
  setSessionInfo(sessionID: string, action: string, userID: string, startTime: string, endTime: string) {
    this.SessionID = sessionID
    this.Action = action
    this.UserID = userID
    this.StartTime = startTime
    this.EndTime = endTime

    this.SubspaceOpEvent.tags.push(
      ['session_id', sessionID],
      ['action', action],
      ['user_id', userID],
      ['start_time', startTime],
    )

    if (endTime) {
      this.SubspaceOpEvent.tags.push(['end_time', endTime])
    }
  }
}

// Function to convert Subspace events to Nostr Event
export function toNostrEvent(
  event:
    | ModelEvent
    | ComputeEvent
    | AlgoEvent
    | ValidEvent
    | DatasetEvent
    | FinetuneEvent
    | ConversationEvent
    | SessionEvent,
): NostrEvent {
  const tags: Tags = event.SubspaceOpEvent.tags

  return {
    created_at: event.SubspaceOpEvent.createdAt,
    kind: event.SubspaceOpEvent.kind,
    tags,
    content: event.SubspaceOpEvent.content,
  }
}

// ParseModelGraphEvent parses a Nostr event into a modelgraph event
function parseModelGraphEvent(evt: NostrEvent): [SubspaceOpEvent | null, Error | null] {
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
          return [null, new Error(`failed to parse auth tag: ${err}`)]
        }
        break
      case 'parent':
        parentHash = tag.slice(1)
    }
  }

  // Get operation from kind
  const [operation, exists] = getOpFromKind(evt.kind)
  if (!exists) {
    return [null, new Error(`unknown kind value: ${evt.kind}`)]
  }

  // Parse based on operation type
  switch (operation as string) {
    case OpModel:
      return parseModelEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpDataset:
      return parseDatasetEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpCompute:
      return parseComputeEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpAlgo:
      return parseAlgoEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpValid:
      return parseValidEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpFinetune:
      return parseFinetuneEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpConversation:
      return parseConversationEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpSession:
      return parseSessionEvent(evt, subspaceID, operation as string, authTag, parentHash)
    default:
      return [null, new Error(`unknown operation type: ${operation}`)]
  }
}

function parseModelEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindModelgraphModel, evt.content)
  const model = new ModelEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let parentHash = ''
  let contributions = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'parent':
        parentHash = tag[1]
        break
      case 'contrib':
        contributions = tag[1]
        break
    }
  }

  if (parentHash) {
    model.setParent(parentHash)
  }
  if (contributions) {
    model.setContributions(contributions)
  }

  return [model.SubspaceOpEvent, null]
}

function parseDatasetEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindModelgraphDataset, evt.content)
  const dataset = new DatasetEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let projectID = ''
  let taskID = ''
  let category = ''
  let format = ''
  let contributors: string[] = []

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'project_id':
        projectID = tag[1]
        break
      case 'task_id':
        taskID = tag[1]
        break
      case 'category':
        category = tag[1]
        break
      case 'format':
        format = tag[1]
        break
      case 'contributors':
        contributors = tag.slice(1)
        break
    }
  }

  dataset.setDatasetInfo(projectID, taskID, category, format, contributors)
  return [dataset.SubspaceOpEvent, null]
}

function parseComputeEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindModelgraphCompute, evt.content)
  const compute = new ComputeEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let computeType = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    if (tag[0] === 'compute_type') {
      computeType = tag[1]
      break
    }
  }

  if (computeType) {
    compute.setComputeType(computeType)
  }

  return [compute.SubspaceOpEvent, null]
}

function parseAlgoEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindModelgraphAlgo, evt.content)
  const algo = new AlgoEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let algoType = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    if (tag[0] === 'algo_type') {
      algoType = tag[1]
      break
    }
  }

  if (algoType) {
    algo.setAlgoType(algoType)
  }

  return [algo.SubspaceOpEvent, null]
}

function parseValidEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindModelgraphValid, evt.content)
  const valid = new ValidEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let validResult = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    if (tag[0] === 'valid_result') {
      validResult = tag[1]
      break
    }
  }

  if (validResult) {
    valid.setValidResult(validResult)
  }

  return [valid.SubspaceOpEvent, null]
}

function parseFinetuneEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindModelgraphFinetune, evt.content)
  const finetune = new FinetuneEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let projectID = ''
  let taskID = ''
  let datasetID = ''
  let providerID = ''
  let modelName = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'project_id':
        projectID = tag[1]
        break
      case 'task_id':
        taskID = tag[1]
        break
      case 'dataset_id':
        datasetID = tag[1]
        break
      case 'provider_id':
        providerID = tag[1]
        break
      case 'model_name':
        modelName = tag[1]
        break
    }
  }

  finetune.setFinetuneInfo(projectID, taskID, datasetID, providerID, modelName)
  return [finetune.SubspaceOpEvent, null]
}

function parseConversationEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindModelgraphConversation, evt.content)
  const conversation = new ConversationEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let sessionID = ''
  let userID = ''
  let modelID = ''
  let timestamp = ''
  let interactionHash = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'session_id':
        sessionID = tag[1]
        break
      case 'user_id':
        userID = tag[1]
        break
      case 'model_id':
        modelID = tag[1]
        break
      case 'timestamp':
        timestamp = tag[1]
        break
      case 'interaction_hash':
        interactionHash = tag[1]
        break
    }
  }

  conversation.setConversationInfo(sessionID, userID, modelID, timestamp, interactionHash)
  return [conversation.SubspaceOpEvent, null]
}

function parseSessionEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindModelgraphSession, evt.content)
  const session = new SessionEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let sessionID = ''
  let action = ''
  let userID = ''
  let startTime = ''
  let endTime = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'session_id':
        sessionID = tag[1]
        break
      case 'action':
        action = tag[1]
        break
      case 'user_id':
        userID = tag[1]
        break
      case 'start_time':
        startTime = tag[1]
        break
      case 'end_time':
        endTime = tag[1]
        break
    }
  }

  session.setSessionInfo(sessionID, action, userID, startTime, endTime)
  return [session.SubspaceOpEvent, null]
}

// NewModelEvent creates a new model event
export async function newModelEvent(subspaceID: string, content: string): Promise<ModelEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindModelgraphModel, content)
  return new ModelEvent(baseEvent)
}

// NewComputeEvent creates a new compute event
export async function newComputeEvent(subspaceID: string, content: string): Promise<ComputeEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindModelgraphCompute, content)
  return new ComputeEvent(baseEvent)
}

// NewAlgoEvent creates a new algo event
export async function newAlgoEvent(subspaceID: string, content: string): Promise<AlgoEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindModelgraphAlgo, content)
  return new AlgoEvent(baseEvent)
}

// NewValidEvent creates a new valid event
export async function newValidEvent(subspaceID: string, content: string): Promise<ValidEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindModelgraphValid, content)
  return new ValidEvent(baseEvent)
}

// NewDatasetEvent creates a new dataset event
export async function newDatasetEvent(subspaceID: string, content: string): Promise<DatasetEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindModelgraphDataset, content)
  return new DatasetEvent(baseEvent)
}

// NewFinetuneEvent creates a new finetune event
export async function newFinetuneEvent(subspaceID: string, content: string): Promise<FinetuneEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindModelgraphFinetune, content)
  return new FinetuneEvent(baseEvent)
}

// NewConversationEvent creates a new conversation event
export async function newConversationEvent(subspaceID: string, content: string): Promise<ConversationEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindModelgraphConversation, content)
  return new ConversationEvent(baseEvent)
}

// NewSessionEvent creates a new session event
export async function newSessionEvent(subspaceID: string, content: string): Promise<SessionEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindModelgraphSession, content)
  return new SessionEvent(baseEvent)
}

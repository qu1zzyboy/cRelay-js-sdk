import { SubspaceOpEvent, NostrEvent, Tags, NewSubspaceOpEvent, setParents } from '../subspace.ts'
import { getOpFromKind } from '../keys.ts'
import { AuthTag } from '../auth.ts'
import {
  KindCommonGraphProject,
  KindCommonGraphTask,
  KindCommonGraphEntity,
  KindCommonGraphRelation,
  KindCommonGraphObservation,
  OpProject,
  OpTask,
  OpEntity,
  OpRelation,
  OpObservation,
} from '../constants.ts'

// ProjectEvent represents a project operation in common graph
class ProjectEvent {
  SubspaceOpEvent: SubspaceOpEvent
  ProjectID: string
  Name: string
  Desc: string
  Members: string[]
  Status: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.ProjectID = ''
    this.Name = ''
    this.Desc = ''
    this.Members = []
    this.Status = ''
  }

  // SetProjectInfo sets the project information
  setProjectInfo(projectID: string, name: string, desc: string, members: string[], status: string) {
    this.ProjectID = projectID
    this.Name = name
    this.Desc = desc
    this.Members = members
    this.Status = status

    this.SubspaceOpEvent.tags.push(['project_id', projectID], ['name', name], ['desc', desc], ['status', status])

    if (members.length > 0) {
      this.SubspaceOpEvent.tags.push(['members', ...members])
    }
  }
}

// TaskEvent represents a task operation in common graph
class TaskEvent {
  SubspaceOpEvent: SubspaceOpEvent
  ProjectID: string
  TaskID: string
  Title: string
  Assignee: string
  Status: string
  Deadline: string
  Priority: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.ProjectID = ''
    this.TaskID = ''
    this.Title = ''
    this.Assignee = ''
    this.Status = ''
    this.Deadline = ''
    this.Priority = ''
  }

  // SetTaskInfo sets the task information
  setTaskInfo(
    projectID: string,
    taskID: string,
    title: string,
    assignee: string,
    status: string,
    deadline: string,
    priority: string,
  ) {
    this.ProjectID = projectID
    this.TaskID = taskID
    this.Title = title
    this.Assignee = assignee
    this.Status = status
    this.Deadline = deadline
    this.Priority = priority

    this.SubspaceOpEvent.tags.push(
      ['project_id', projectID],
      ['task_id', taskID],
      ['title', title],
      ['assignee', assignee],
      ['status', status],
      ['deadline', deadline],
      ['priority', priority],
    )
  }
}

// EntityEvent represents an entity operation in common graph
class EntityEvent {
  SubspaceOpEvent: SubspaceOpEvent
  EntityName: string
  EntityType: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.EntityName = ''
    this.EntityType = ''
  }

  // SetEntityInfo sets the entity information
  setEntityInfo(entityName: string, entityType: string) {
    this.EntityName = entityName
    this.EntityType = entityType

    this.SubspaceOpEvent.tags.push(['entity_name', entityName], ['entity_type', entityType])
  }
}

// RelationEvent represents a relation operation in common graph
class RelationEvent {
  SubspaceOpEvent: SubspaceOpEvent
  From: string
  To: string
  RelationType: string
  Context: string
  Weight: number
  Description: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.From = ''
    this.To = ''
    this.RelationType = ''
    this.Context = ''
    this.Weight = 0
    this.Description = ''
  }

  // SetRelationInfo sets the relation information
  setRelationInfo(
    from: string,
    to: string,
    relationType: string,
    context: string,
    weight: number,
    description: string,
  ) {
    this.From = from
    this.To = to
    this.RelationType = relationType
    this.Context = context
    this.Weight = weight
    this.Description = description

    this.SubspaceOpEvent.tags.push(
      ['from', from],
      ['to', to],
      ['relation_type', relationType],
      ['weight', weight.toString()],
    )

    if (context) {
      this.SubspaceOpEvent.tags.push(['context', context])
    }

    if (description) {
      this.SubspaceOpEvent.tags.push(['description', description])
    }
  }
}

// ObservationEvent represents an observation operation in common graph
class ObservationEvent {
  SubspaceOpEvent: SubspaceOpEvent
  EntityName: string
  Observation: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.EntityName = ''
    this.Observation = ''
  }

  // SetObservationInfo sets the observation information
  setObservationInfo(entityName: string, observation: string) {
    this.EntityName = entityName
    this.Observation = observation

    this.SubspaceOpEvent.tags.push(['entity_name', entityName], ['observation', observation])
  }
}

// Function to convert Subspace events to Nostr Event
export function toNostrEvent(
  event: ProjectEvent | TaskEvent | EntityEvent | RelationEvent | ObservationEvent,
): NostrEvent {
  const tags: Tags = event.SubspaceOpEvent.tags

  return {
    created_at: event.SubspaceOpEvent.createdAt,
    kind: event.SubspaceOpEvent.kind,
    tags,
    content: event.SubspaceOpEvent.content,
  }
}

// ParseCommonGraphEvent parses a Nostr event into a common graph event
function parseCommonGraphEvent(evt: NostrEvent): [SubspaceOpEvent | null, Error | null] {
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
    case OpProject:
      return parseProjectEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpTask:
      return parseTaskEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpEntity:
      return parseEntityEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpRelation:
      return parseRelationEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpObservation:
      return parseObservationEvent(evt, subspaceID, operation as string, authTag, parentHash)
    default:
      return [null, new Error(`unknown operation type: ${operation}`)]
  }
}

function parseProjectEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindCommonGraphProject, evt.content)
  const project = new ProjectEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let projectID = ''
  let name = ''
  let desc = ''
  let members: string[] = []
  let status = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'project_id':
        projectID = tag[1]
        break
      case 'name':
        name = tag[1]
        break
      case 'desc':
        desc = tag[1]
        break
      case 'members':
        members = tag.slice(1)
        break
      case 'status':
        status = tag[1]
        break
    }
  }

  project.setProjectInfo(projectID, name, desc, members, status)
  return [project.SubspaceOpEvent, null]
}

function parseTaskEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindCommonGraphTask, evt.content)
  const task = new TaskEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let projectID = ''
  let taskID = ''
  let title = ''
  let assignee = ''
  let status = ''
  let deadline = ''
  let priority = ''

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
      case 'title':
        title = tag[1]
        break
      case 'assignee':
        assignee = tag[1]
        break
      case 'status':
        status = tag[1]
        break
      case 'deadline':
        deadline = tag[1]
        break
      case 'priority':
        priority = tag[1]
        break
    }
  }

  task.setTaskInfo(projectID, taskID, title, assignee, status, deadline, priority)
  return [task.SubspaceOpEvent, null]
}

function parseEntityEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindCommonGraphEntity, evt.content)
  const entity = new EntityEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let entityName = ''
  let entityType = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'entity_name':
        entityName = tag[1]
        break
      case 'entity_type':
        entityType = tag[1]
        break
    }
  }

  entity.setEntityInfo(entityName, entityType)
  return [entity.SubspaceOpEvent, null]
}

function parseRelationEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindCommonGraphRelation, evt.content)
  const relation = new RelationEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let from = ''
  let to = ''
  let relationType = ''
  let context = ''
  let weight = 0
  let description = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'from':
        from = tag[1]
        break
      case 'to':
        to = tag[1]
        break
      case 'relation_type':
        relationType = tag[1]
        break
      case 'context':
        context = tag[1]
        break
      case 'weight':
        weight = parseInt(tag[1])
        break
      case 'description':
        description = tag[1]
        break
    }
  }

  relation.setRelationInfo(from, to, relationType, context, weight, description)
  return [relation.SubspaceOpEvent, null]
}

function parseObservationEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindCommonGraphObservation, evt.content)
  const observationEvent = new ObservationEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let entityName = ''
  let observationText = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'entity_name':
        entityName = tag[1]
        break
      case 'observation':
        observationText = tag[1]
        break
    }
  }

  observationEvent.setObservationInfo(entityName, observationText)
  return [observationEvent.SubspaceOpEvent, null]
}

// NewProjectEvent creates a new project event
export async function newProjectEvent(subspaceID: string, content: string): Promise<ProjectEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindCommonGraphProject, content)
  return new ProjectEvent(baseEvent)
}

// NewTaskEvent creates a new task event
export async function newTaskEvent(subspaceID: string, content: string): Promise<TaskEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindCommonGraphTask, content)
  return new TaskEvent(baseEvent)
}

// NewEntityEvent creates a new entity event
export async function newEntityEvent(subspaceID: string, content: string): Promise<EntityEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindCommonGraphEntity, content)
  return new EntityEvent(baseEvent)
}

// NewRelationEvent creates a new relation event
export async function newRelationEvent(subspaceID: string, content: string): Promise<RelationEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindCommonGraphRelation, content)
  return new RelationEvent(baseEvent)
}

// NewObservationEvent creates a new observation event
export async function newObservationEvent(subspaceID: string, content: string): Promise<ObservationEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindCommonGraphObservation, content)
  return new ObservationEvent(baseEvent)
}

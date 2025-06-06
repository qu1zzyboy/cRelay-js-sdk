import { SubspaceOpEvent, NostrEvent, Tags, NewSubspaceOpEvent, setParents } from '../subspace.ts'
import { getOpFromKind } from '../keys.ts'
import { AuthTag } from '../auth.ts'
import {
  KindSocialLike,
  KindSocialCollect,
  KindSocialShare,
  KindSocialComment,
  KindSocialTag,
  KindSocialFollow,
  KindSocialUnfollow,
  KindSocialQuestion,
  KindSocialRoom,
  KindSocialMessageInRoom,
  OpLike,
  OpCollect,
  OpShare,
  OpComment,
  OpTag,
  OpFollow,
  OpUnfollow,
  OpQuestion,
  OpRoom,
  OpMessageInRoom,
} from '../constants.ts'

// LikeEvent represents a like operation
class LikeEvent {
  SubspaceOpEvent: SubspaceOpEvent
  ObjectID: string
  UserID: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.ObjectID = ''
    this.UserID = ''
  }

  setLikeInfo(objectID: string, userID: string) {
    this.ObjectID = objectID
    this.UserID = userID
    this.SubspaceOpEvent.tags.push(['object_id', objectID], ['user_id', userID])
  }
}

// CollectEvent represents a collect/favorite operation
class CollectEvent {
  SubspaceOpEvent: SubspaceOpEvent
  ObjectID: string
  UserID: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.ObjectID = ''
    this.UserID = ''
  }

  setCollectInfo(objectID: string, userID: string) {
    this.ObjectID = objectID
    this.UserID = userID
    this.SubspaceOpEvent.tags.push(['object_id', objectID], ['user_id', userID])
  }
}

// ShareEvent represents a share operation
class ShareEvent {
  SubspaceOpEvent: SubspaceOpEvent
  ObjectID: string
  UserID: string
  Platform: string
  Clicks: number

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.ObjectID = ''
    this.UserID = ''
    this.Platform = ''
    this.Clicks = 0
  }

  setShareInfo(objectID: string, userID: string, platform: string, clicks: number) {
    this.ObjectID = objectID
    this.UserID = userID
    this.Platform = platform
    this.Clicks = clicks
    this.SubspaceOpEvent.tags.push(
      ['object_id', objectID],
      ['user_id', userID],
      ['platform', platform],
      ['clicks', clicks.toString()],
    )
  }
}

// CommentEvent represents a comment operation
class CommentEvent {
  SubspaceOpEvent: SubspaceOpEvent
  ObjectID: string
  UserID: string
  Parent: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.ObjectID = ''
    this.UserID = ''
    this.Parent = ''
  }

  setCommentInfo(objectID: string, userID: string, parent: string, content: string) {
    this.ObjectID = objectID
    this.UserID = userID
    this.Parent = parent
    this.SubspaceOpEvent.tags.push(['object_id', objectID], ['user_id', userID], ['parent', parent])
    this.SubspaceOpEvent.content = content
  }
}

// TagEvent represents a tag operation
class TagEvent {
  SubspaceOpEvent: SubspaceOpEvent
  ObjectID: string
  Tag: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.ObjectID = ''
    this.Tag = ''
  }

  setTagInfo(objectID: string, tag: string) {
    this.ObjectID = objectID
    this.Tag = tag
    this.SubspaceOpEvent.tags.push(['object_id', objectID], ['tag', tag])
  }
}

// FollowEvent represents a follow operation
class FollowEvent {
  SubspaceOpEvent: SubspaceOpEvent
  UserID: string
  TargetID: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.UserID = ''
    this.TargetID = ''
  }

  setFollowInfo(userID: string, targetID: string) {
    this.UserID = userID
    this.TargetID = targetID
    this.SubspaceOpEvent.tags.push(['user_id', userID], ['target_id', targetID])
  }
}

// UnfollowEvent represents an unfollow operation
class UnfollowEvent {
  SubspaceOpEvent: SubspaceOpEvent
  UserID: string
  TargetID: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.UserID = ''
    this.TargetID = ''
  }

  setUnfollowInfo(userID: string, targetID: string) {
    this.UserID = userID
    this.TargetID = targetID
    this.SubspaceOpEvent.tags.push(['user_id', userID], ['target_id', targetID])
  }
}

// QuestionEvent represents a question operation
class QuestionEvent {
  SubspaceOpEvent: SubspaceOpEvent
  ObjectID: string
  UserID: string
  Quality: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.ObjectID = ''
    this.UserID = ''
    this.Quality = ''
  }

  setQuestionInfo(objectID: string, userID: string, content: string, quality: string) {
    this.ObjectID = objectID
    this.UserID = userID
    this.Quality = quality
    this.SubspaceOpEvent.tags.push(['object_id', objectID], ['user_id', userID], ['quality', quality])
    this.SubspaceOpEvent.content = content
  }
}

// RoomEvent represents a chat room
class RoomEvent {
  SubspaceOpEvent: SubspaceOpEvent
  Name: string
  Description: string
  Members: string[]

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.Name = ''
    this.Description = ''
    this.Members = []
  }

  setRoomInfo(name: string, description: string, members: string[]) {
    this.Name = name
    this.Description = description
    this.Members = members
    this.SubspaceOpEvent.tags.push(['name', name], ['description', description])
    if (members.length > 0) {
      this.SubspaceOpEvent.tags.push(['members', ...members])
    }
  }
}

// MessageInRoomEvent represents a chat message in a room
class MessageInRoomEvent {
  SubspaceOpEvent: SubspaceOpEvent
  RoomID: string
  ReplyTo: string
  Mentions: string[]

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.RoomID = ''
    this.ReplyTo = ''
    this.Mentions = []
  }

  setMessageInfo(roomID: string, content: string, replyTo: string, mentions: string[]) {
    this.RoomID = roomID
    this.ReplyTo = replyTo
    this.Mentions = mentions
    this.SubspaceOpEvent.tags.push(['room_id', roomID])
    if (replyTo) {
      this.SubspaceOpEvent.tags.push(['reply_to', replyTo])
    }
    if (mentions.length > 0) {
      this.SubspaceOpEvent.tags.push(['mentions', ...mentions])
    }
    this.SubspaceOpEvent.content = content
  }
}

// Function to convert Subspace events to Nostr Event
export function toNostrEvent(
  event:
    | LikeEvent
    | CollectEvent
    | ShareEvent
    | CommentEvent
    | TagEvent
    | FollowEvent
    | UnfollowEvent
    | QuestionEvent
    | RoomEvent
    | MessageInRoomEvent,
): NostrEvent {
  const tags: Tags = event.SubspaceOpEvent.tags

  return {
    created_at: event.SubspaceOpEvent.createdAt,
    kind: event.SubspaceOpEvent.kind,
    tags,
    content: event.SubspaceOpEvent.content,
  }
}

// ParseSocialEvent parses a Nostr event into a social event
function parseSocialEvent(evt: NostrEvent): [SubspaceOpEvent | null, Error | null] {
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
    case OpLike:
      return parseLikeEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpCollect:
      return parseCollectEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpShare:
      return parseShareEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpComment:
      return parseCommentEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpTag:
      return parseTagEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpFollow:
      return parseFollowEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpUnfollow:
      return parseUnfollowEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpQuestion:
      return parseQuestionEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpRoom:
      return parseRoomEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpMessageInRoom:
      return parseMessageInRoomEvent(evt, subspaceID, operation as string, authTag, parentHash)
    default:
      return [null, new Error(`unknown operation type: ${operation}`)]
  }
}

function parseLikeEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindSocialLike, evt.content)
  const like = new LikeEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let objectID = ''
  let userID = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'object_id':
        objectID = tag[1]
        break
      case 'user_id':
        userID = tag[1]
        break
    }
  }

  like.setLikeInfo(objectID, userID)
  return [like.SubspaceOpEvent, null]
}

function parseCollectEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindSocialCollect, evt.content)
  const collect = new CollectEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let objectID = ''
  let userID = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'object_id':
        objectID = tag[1]
        break
      case 'user_id':
        userID = tag[1]
        break
    }
  }

  collect.setCollectInfo(objectID, userID)
  return [collect.SubspaceOpEvent, null]
}

function parseShareEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindSocialShare, evt.content)
  const share = new ShareEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let objectID = ''
  let userID = ''
  let platform = ''
  let clicks = 0

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'object_id':
        objectID = tag[1]
        break
      case 'user_id':
        userID = tag[1]
        break
      case 'platform':
        platform = tag[1]
        break
      case 'clicks':
        clicks = parseInt(tag[1])
        break
    }
  }

  share.setShareInfo(objectID, userID, platform, clicks)
  return [share.SubspaceOpEvent, null]
}

function parseCommentEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindSocialComment, evt.content)
  const comment = new CommentEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let objectID = ''
  let userID = ''
  let parent = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'object_id':
        objectID = tag[1]
        break
      case 'user_id':
        userID = tag[1]
        break
      case 'parent':
        parent = tag[1]
        break
    }
  }

  comment.setCommentInfo(objectID, userID, parent, evt.content)
  return [comment.SubspaceOpEvent, null]
}

function parseTagEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindSocialTag, evt.content)
  const tag = new TagEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let objectID = ''
  let tagValue = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'object_id':
        objectID = tag[1]
        break
      case 'tag':
        tagValue = tag[1]
        break
    }
  }

  tag.setTagInfo(objectID, tagValue)
  return [tag.SubspaceOpEvent, null]
}

function parseFollowEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindSocialFollow, evt.content)
  const follow = new FollowEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let userID = ''
  let targetID = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'user_id':
        userID = tag[1]
        break
      case 'target_id':
        targetID = tag[1]
        break
    }
  }

  follow.setFollowInfo(userID, targetID)
  return [follow.SubspaceOpEvent, null]
}

function parseUnfollowEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindSocialUnfollow, evt.content)
  const unfollow = new UnfollowEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let userID = ''
  let targetID = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'user_id':
        userID = tag[1]
        break
      case 'target_id':
        targetID = tag[1]
        break
    }
  }

  unfollow.setUnfollowInfo(userID, targetID)
  return [unfollow.SubspaceOpEvent, null]
}

function parseQuestionEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindSocialQuestion, evt.content)
  const question = new QuestionEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let objectID = ''
  let userID = ''
  let quality = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'object_id':
        objectID = tag[1]
        break
      case 'user_id':
        userID = tag[1]
        break
      case 'quality':
        quality = tag[1]
        break
    }
  }

  question.setQuestionInfo(objectID, userID, evt.content, quality)
  return [question.SubspaceOpEvent, null]
}

function parseRoomEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindSocialRoom, evt.content)
  const room = new RoomEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let name = ''
  let description = ''
  let members: string[] = []

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'name':
        name = tag[1]
        break
      case 'description':
        description = tag[1]
        break
      case 'members':
        members = tag.slice(1)
        break
    }
  }

  room.setRoomInfo(name, description, members)
  return [room.SubspaceOpEvent, null]
}

function parseMessageInRoomEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindSocialMessageInRoom, evt.content)
  const message = new MessageInRoomEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let roomID = ''
  let replyTo = ''
  let mentions: string[] = []

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'room_id':
        roomID = tag[1]
        break
      case 'reply_to':
        replyTo = tag[1]
        break
      case 'mentions':
        mentions = tag.slice(1)
        break
    }
  }

  message.setMessageInfo(roomID, evt.content, replyTo, mentions)
  return [message.SubspaceOpEvent, null]
}

// Factory functions for creating new events
export async function newLikeEvent(subspaceID: string, content: string): Promise<LikeEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindSocialLike, content)
  return new LikeEvent(baseEvent)
}

export async function newCollectEvent(subspaceID: string, content: string): Promise<CollectEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindSocialCollect, content)
  return new CollectEvent(baseEvent)
}

export async function newShareEvent(subspaceID: string, content: string): Promise<ShareEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindSocialShare, content)
  return new ShareEvent(baseEvent)
}

export async function newCommentEvent(subspaceID: string, content: string): Promise<CommentEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindSocialComment, content)
  return new CommentEvent(baseEvent)
}

export async function newTagEvent(subspaceID: string, content: string): Promise<TagEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindSocialTag, content)
  return new TagEvent(baseEvent)
}

export async function newFollowEvent(subspaceID: string, content: string): Promise<FollowEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindSocialFollow, content)
  return new FollowEvent(baseEvent)
}

export async function newUnfollowEvent(subspaceID: string, content: string): Promise<UnfollowEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindSocialUnfollow, content)
  return new UnfollowEvent(baseEvent)
}

export async function newQuestionEvent(subspaceID: string, content: string): Promise<QuestionEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindSocialQuestion, content)
  return new QuestionEvent(baseEvent)
}

export async function newRoomEvent(subspaceID: string, content: string): Promise<RoomEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindSocialRoom, content)
  return new RoomEvent(baseEvent)
}

export async function newMessageInRoomEvent(subspaceID: string, content: string): Promise<MessageInRoomEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindSocialMessageInRoom, content)
  return new MessageInRoomEvent(baseEvent)
}

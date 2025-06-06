import { SubspaceOpEvent, NostrEvent, Tags, NewSubspaceOpEvent, setParents } from '../subspace.ts'
import { getOpFromKind } from '../keys.ts'
import { AuthTag } from '../auth.ts'
import {
  KindCommunityCreate,
  KindCommunityInvite,
  KindCommunityChannelCreate,
  KindCommunityChannelMessage,
  OpCommunityCreate,
  OpCommunityInvite,
  OpChannelCreate,
  OpChannelMessage,
} from '../constants.ts'

// CommunityCreateEvent represents a community creation operation
class CommunityCreateEvent {
  SubspaceOpEvent: SubspaceOpEvent
  CommunityID: string
  Name: string
  Type: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.CommunityID = ''
    this.Name = ''
    this.Type = ''
  }

  setCommunityInfo(communityID: string, name: string, type: string) {
    this.CommunityID = communityID
    this.Name = name
    this.Type = type
    this.SubspaceOpEvent.tags.push(['community_id', communityID], ['name', name], ['type', type])
  }
}

// CommunityInviteEvent represents a community invitation operation
class CommunityInviteEvent {
  SubspaceOpEvent: SubspaceOpEvent
  CommunityID: string
  InviterID: string
  InviteeID: string
  Method: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.CommunityID = ''
    this.InviterID = ''
    this.InviteeID = ''
    this.Method = ''
  }

  setInviteInfo(communityID: string, inviterID: string, inviteeID: string, method: string) {
    this.CommunityID = communityID
    this.InviterID = inviterID
    this.InviteeID = inviteeID
    this.Method = method
    this.SubspaceOpEvent.tags.push(
      ['community_id', communityID],
      ['inviter_id', inviterID],
      ['invitee_id', inviteeID],
      ['method', method],
    )
  }
}

// ChannelCreateEvent represents a channel creation operation
class ChannelCreateEvent {
  SubspaceOpEvent: SubspaceOpEvent
  CommunityID: string
  ChannelID: string
  Name: string
  Type: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.CommunityID = ''
    this.ChannelID = ''
    this.Name = ''
    this.Type = ''
  }

  setChannelInfo(communityID: string, channelID: string, name: string, type: string) {
    this.CommunityID = communityID
    this.ChannelID = channelID
    this.Name = name
    this.Type = type
    this.SubspaceOpEvent.tags.push(
      ['community_id', communityID],
      ['channel_id', channelID],
      ['name', name],
      ['type', type],
    )
  }
}

// ChannelMessageEvent represents a channel message operation
class ChannelMessageEvent {
  SubspaceOpEvent: SubspaceOpEvent
  ChannelID: string
  UserID: string
  ReplyTo: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.ChannelID = ''
    this.UserID = ''
    this.ReplyTo = ''
  }

  setMessageInfo(channelID: string, userID: string, content: string, replyTo: string) {
    this.ChannelID = channelID
    this.UserID = userID
    this.ReplyTo = replyTo
    this.SubspaceOpEvent.tags.push(['channel_id', channelID], ['user_id', userID])
    if (replyTo) {
      this.SubspaceOpEvent.tags.push(['reply_to', replyTo])
    }
    this.SubspaceOpEvent.content = content
  }
}

// Function to convert Subspace events to Nostr Event
export function toNostrEvent(
  event: CommunityCreateEvent | CommunityInviteEvent | ChannelCreateEvent | ChannelMessageEvent,
): NostrEvent {
  const tags: Tags = event.SubspaceOpEvent.tags

  return {
    created_at: event.SubspaceOpEvent.createdAt,
    kind: event.SubspaceOpEvent.kind,
    tags,
    content: event.SubspaceOpEvent.content,
  }
}

// ParseCommunityEvent parses a Nostr event into a community event
function parseCommunityEvent(evt: NostrEvent): [SubspaceOpEvent | null, Error | null] {
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
    case OpCommunityCreate:
      return parseCommunityCreateEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpCommunityInvite:
      return parseCommunityInviteEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpChannelCreate:
      return parseChannelCreateEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpChannelMessage:
      return parseChannelMessageEvent(evt, subspaceID, operation as string, authTag, parentHash)
    default:
      return [null, new Error(`unknown operation type: ${operation}`)]
  }
}

function parseCommunityCreateEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindCommunityCreate, evt.content)
  const community = new CommunityCreateEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let communityID = ''
  let name = ''
  let type = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'community_id':
        communityID = tag[1]
        break
      case 'name':
        name = tag[1]
        break
      case 'type':
        type = tag[1]
        break
    }
  }

  community.setCommunityInfo(communityID, name, type)
  return [community.SubspaceOpEvent, null]
}

function parseCommunityInviteEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindCommunityInvite, evt.content)
  const invite = new CommunityInviteEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let communityID = ''
  let inviterID = ''
  let inviteeID = ''
  let method = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'community_id':
        communityID = tag[1]
        break
      case 'inviter_id':
        inviterID = tag[1]
        break
      case 'invitee_id':
        inviteeID = tag[1]
        break
      case 'method':
        method = tag[1]
        break
    }
  }

  invite.setInviteInfo(communityID, inviterID, inviteeID, method)
  return [invite.SubspaceOpEvent, null]
}

function parseChannelCreateEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindCommunityChannelCreate, evt.content)
  const channel = new ChannelCreateEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let communityID = ''
  let channelID = ''
  let name = ''
  let type = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'community_id':
        communityID = tag[1]
        break
      case 'channel_id':
        channelID = tag[1]
        break
      case 'name':
        name = tag[1]
        break
      case 'type':
        type = tag[1]
        break
    }
  }

  channel.setChannelInfo(communityID, channelID, name, type)
  return [channel.SubspaceOpEvent, null]
}

function parseChannelMessageEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindCommunityChannelMessage, evt.content)
  const message = new ChannelMessageEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let channelID = ''
  let userID = ''
  let replyTo = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'channel_id':
        channelID = tag[1]
        break
      case 'user_id':
        userID = tag[1]
        break
      case 'reply_to':
        replyTo = tag[1]
        break
    }
  }

  message.setMessageInfo(channelID, userID, evt.content, replyTo)
  return [message.SubspaceOpEvent, null]
}

// Factory functions for creating new events
export async function newCommunityCreateEvent(
  subspaceID: string,
  content: string,
): Promise<CommunityCreateEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindCommunityCreate, content)
  return new CommunityCreateEvent(baseEvent)
}

export async function newCommunityInviteEvent(
  subspaceID: string,
  content: string,
): Promise<CommunityInviteEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindCommunityInvite, content)
  return new CommunityInviteEvent(baseEvent)
}

export async function newChannelCreateEvent(subspaceID: string, content: string): Promise<ChannelCreateEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindCommunityChannelCreate, content)
  return new ChannelCreateEvent(baseEvent)
}

export async function newChannelMessageEvent(subspaceID: string, content: string): Promise<ChannelMessageEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindCommunityChannelMessage, content)
  return new ChannelMessageEvent(baseEvent)
}

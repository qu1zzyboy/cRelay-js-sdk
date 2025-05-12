import { SubspaceOpEvent, NostrEvent, Tags, NewSubspaceOpEvent, setParents } from '../subspace.ts'
import { getOpFromKind } from '../keys.ts'
import { AuthTag } from '../auth.ts'
import {
  KindGovernancePost,
  KindGovernancePropose,
  KindGovernanceVote,
  KindGovernanceInvite,
  KindGovernanceMint,
} from '../constants.ts'

// PostEvent represents a post operation in governance subspace
class PostEvent {
  SubspaceOpEvent: SubspaceOpEvent
  ContentType: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.ContentType = ''
  }

  // SetContentType sets the content type for the operation
  setContentType(contentType: string) {
    this.ContentType = contentType
    this.SubspaceOpEvent.tags.push(['content_type', contentType])
  }
}

// ProposeEvent represents a propose operation in governance subspace
class ProposeEvent {
  SubspaceOpEvent: SubspaceOpEvent
  ProposalID: string
  Rules: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.ProposalID = ''
    this.Rules = ''
  }

  // SetProposal sets the proposal ID and rules
  setProposal(proposalID: string, rules: string) {
    this.ProposalID = proposalID
    this.Rules = rules
    this.SubspaceOpEvent.tags.push(['proposal_id', proposalID])
    if (rules) {
      this.SubspaceOpEvent.tags.push(['rules', rules])
    }
  }
}

// VoteEvent represents a vote operation in governance subspace
class VoteEvent {
  SubspaceOpEvent: SubspaceOpEvent
  ProposalID: string
  Vote: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.ProposalID = ''
    this.Vote = ''
  }

  // SetVote sets the vote for a proposal
  setVote(proposalID: string, vote: string) {
    this.ProposalID = proposalID
    this.Vote = vote
    this.SubspaceOpEvent.tags.push(['proposal_id', proposalID], ['vote', vote])
  }
}

// InviteEvent represents an invite operation in governance subspace
class InviteEvent {
  SubspaceOpEvent: SubspaceOpEvent
  InviterAddr: string
  Rules: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.InviterAddr = ''
    this.Rules = ''
  }

  // SetInvite sets the inviter address and rules
  setInvite(inviterAddress: string, rules: string) {
    this.InviterAddr = inviterAddress
    this.SubspaceOpEvent.tags.push(['inviter_addr', inviterAddress])
    if (rules) {
      this.Rules = rules // Ensure rules are set correctly
      this.SubspaceOpEvent.tags.push(['rules', rules])
    }
  }
}

// MintEvent represents a mint operation in governance subspace
class MintEvent {
  SubspaceOpEvent: SubspaceOpEvent
  TokenName: string
  TokenSymbol: string
  TokenDecimals: string
  InitialSupply: string
  DropRatio: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.TokenName = ''
    this.TokenSymbol = ''
    this.TokenDecimals = ''
    this.InitialSupply = ''
    this.DropRatio = ''
  }

  // SetTokenInfo sets the token information
  setTokenInfo(tokenName: string, tokenSymbol: string, tokenDecimals: string) {
    this.TokenName = tokenName
    this.TokenSymbol = tokenSymbol
    this.TokenDecimals = tokenDecimals
    this.SubspaceOpEvent.tags.push(['token_name', tokenName])
    this.SubspaceOpEvent.tags.push(['token_symbol', tokenSymbol])
    this.SubspaceOpEvent.tags.push(['token_decimals', tokenDecimals])
  }

  // SetMintDetails sets the initial supply and drop ratio
  setMintDetails(initialSupply: string, dropRatio: string) {
    this.InitialSupply = initialSupply
    this.DropRatio = dropRatio
    this.SubspaceOpEvent.tags.push(['initial_supply', initialSupply])
    this.SubspaceOpEvent.tags.push(['drop_ratio', dropRatio])
  }
}

// Function to convert Subspace events to Nostr Event
export function toNostrEvent(event: PostEvent | ProposeEvent | VoteEvent | InviteEvent | MintEvent): NostrEvent {
  const tags: Tags = event.SubspaceOpEvent.tags

  return {
    created_at: event.SubspaceOpEvent.createdAt,
    kind: event.SubspaceOpEvent.kind,
    tags,
    content: event.SubspaceOpEvent.content,
  }
}

// ParseGovernanceEvent parses a Nostr event into a governance event
function parseGovernanceEvent(evt: NostrEvent): [SubspaceOpEvent | null, Error | null] {
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
  switch (operation) {
    case 'post':
      return parsePostEvent(evt, subspaceID, operation, authTag, parentHash)
    case 'propose':
      return parseProposeEvent(evt, subspaceID, operation, authTag, parentHash)
    case 'vote':
      return parseVoteEvent(evt, subspaceID, operation, authTag, parentHash)
    case 'invite':
      return parseInviteEvent(evt, subspaceID, operation, authTag, parentHash)
    case 'mint':
      return parseMintEvent(evt, subspaceID, operation, authTag, parentHash)
    default:
      return [null, new Error(`unknown operation type: ${operation}`)]
  }
}

function parsePostEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindGovernancePost, evt.content)
  const post = new PostEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'content_type':
        post.setContentType(tag[1])
        break
    }
  }

  return [post.SubspaceOpEvent, null]
}

function parseProposeEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindGovernancePropose, evt.content)
  const propose = new ProposeEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'proposal_id':
        propose.setProposal(tag[1], propose.Rules)
        break
      case 'rules':
        propose.setProposal(propose.ProposalID, tag[1])
        break
    }
  }

  return [propose.SubspaceOpEvent, null]
}

function parseVoteEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindGovernanceVote, evt.content)
  const vote = new VoteEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'proposal_id':
        vote.setVote(tag[1], vote.Vote)
        break
      case 'vote':
        vote.setVote(vote.ProposalID, tag[1])
        break
    }
  }

  return [vote.SubspaceOpEvent, null]
}

function parseInviteEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindGovernanceInvite, evt.content)
  const invite = new InviteEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'inviter_addr':
        invite.setInvite(tag[1], invite.Rules)
        break
      case 'rules':
        invite.setInvite(invite.InviterAddr, tag[1])
        break
    }
  }

  return [invite.SubspaceOpEvent, null]
}

function parseMintEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindGovernanceMint, evt.content)
  const mint = new MintEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'token_name':
        mint.TokenName = tag[1]
        break
      case 'token_symbol':
        mint.TokenSymbol = tag[1]
        break
      case 'token_decimals':
        mint.TokenDecimals = tag[1]
        break
      case 'initial_supply':
        mint.InitialSupply = tag[1]
        break
      case 'drop_ratio':
        mint.DropRatio = tag[1]
        break
    }
  }

  // Set the token info and mint details after parsing
  if (mint.TokenName && mint.TokenSymbol && mint.TokenDecimals) {
    mint.setTokenInfo(mint.TokenName, mint.TokenSymbol, mint.TokenDecimals)
  }

  if (mint.InitialSupply && mint.DropRatio) {
    mint.setMintDetails(mint.InitialSupply, mint.DropRatio)
  }

  return [mint.SubspaceOpEvent, null]
}

// NewPostEvent creates a new post event
export async function newPostEvent(subspaceID: string, content: string): Promise<PostEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindGovernancePost, content)
  return new PostEvent(baseEvent)
}

// NewProposeEvent creates a new propose event
export async function newProposeEvent(subspaceID: string, content: string): Promise<ProposeEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindGovernancePropose, content)
  return new ProposeEvent(baseEvent)
}

// NewVoteEvent creates a new vote event
export async function newVoteEvent(subspaceID: string, content: string): Promise<VoteEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindGovernanceVote, content)
  return new VoteEvent(baseEvent)
}

// NewInviteEvent creates a new invite event
export async function newInviteEvent(subspaceID: string, content: string): Promise<InviteEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindGovernanceInvite, content)
  return new InviteEvent(baseEvent)
}

// NewMintEvent creates a new mint event
export async function newMintEvent(subspaceID: string, content: string): Promise<MintEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindGovernanceMint, content)
  return new MintEvent(baseEvent)
}
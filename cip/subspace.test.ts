import { expect, test } from 'bun:test'
import { KindSubspaceCreate, KindSubspaceJoin, OpPost, KindGovernancePost, KindGovernanceVote } from './constants.ts'
import { newPostEvent } from './cip01/governance.ts'
import {
  NostrEvent,
  NewSubspaceCreateEvent,
  ValidateSubspaceCreateEvent,
  NewSubspaceJoinEvent,
  ValidateSubspaceJoinEvent,
  NewSubspaceOpEvent,
  setParents,
} from './subspace.ts'

test('SubspaceCreateEvent: should create a valid event', () => {
  const event = NewSubspaceCreateEvent(
    'TestSubspace',
    'post=1,propose=2',
    'rule1',
    'This is a test subspace',
    'http://example.com/image.png',
  )

  expect(event.kind).toBe(KindSubspaceCreate)
  expect(event.subspaceName).toBe('TestSubspace')
  expect(event.ops).toBe('post=1,propose=2')
  expect(event.rules).toBe('rule1')
  expect(event.description).toBe('This is a test subspace')
  expect(event.imageURL).toBe('http://example.com/image.png')
  expect(event.tags).toContainEqual(['d', 'subspace_create'])
  expect(event.tags).toContainEqual(['sid', event.subspaceID])
})

test('SubspaceCreateEvent: should validate a valid event', () => {
  const event = NewSubspaceCreateEvent(
    'TestSubspace',
    'post=1,propose=2',
    'rule1',
    'This is a test subspace',
    'http://example.com/image.png',
  )

  expect(() => ValidateSubspaceCreateEvent(event)).not.toThrow()
})

test('SubspaceCreateEvent: should throw error for invalid ops', () => {
  const event = NewSubspaceCreateEvent('TestSubspace', 'invalid_ops', '', 'TestSubspace invalid_ops', '')

  expect(() => ValidateSubspaceCreateEvent(event)).toThrow(
    'Invalid ops format: invalid_ops. Each part must be in the format key=value.',
  )
})

test('SubspaceJoinEvent: should create a valid event', () => {
  const event = NewSubspaceJoinEvent('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', "")

  expect(event.kind).toBe(KindSubspaceJoin)
  expect(event.subspaceID).toBe('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
  expect(event.tags).toContainEqual(['d', 'subspace_join'])
  expect(event.tags).toContainEqual(['sid', '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'])
})

test('SubspaceJoinEvent: should validate a valid event', () => {
  const event = NewSubspaceJoinEvent('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', "")

  expect(() => ValidateSubspaceJoinEvent(event)).not.toThrow()
})

test('SubspaceJoinEvent: should throw error for invalid subspace ID', () => {
  const event = NewSubspaceJoinEvent('invalid_sid', "")

  expect(() => ValidateSubspaceJoinEvent(event)).toThrow('Invalid subspace ID format or length')
})

test('SubspaceOpEvent: should set additional properties', async () => {
  const postEvent = await newPostEvent('0x1234567890abcdef', "")
  if (!postEvent) {
    throw new Error('Failed to create post event')
  }

  postEvent.setContentType('text/plain')
  postEvent.SubspaceOpEvent
  setParents(postEvent.SubspaceOpEvent, ['213425955dc44ecd0d12a4af527ab66b71b1b77603a144c2581f8d32826d81ec'])
  expect(postEvent.SubspaceOpEvent.tags).toContainEqual(['content_type', 'text/plain'])
  expect(postEvent.SubspaceOpEvent.tags).toContainEqual(['parent', '213425955dc44ecd0d12a4af527ab66b71b1b77603a144c2581f8d32826d81ec'])
})

test('SubspaceOpEvent: should validate a valid event', () => {
  const event = NewSubspaceOpEvent(
    '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    KindGovernancePost,
    'Test content',
  )

  expect(event.kind).toBe(KindGovernancePost)
  expect(event.subspaceID).toBe('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
  expect(event.operation).toBe(OpPost)
  expect(event.tags).toContainEqual(['d', 'subspace_op'])
  expect(event.tags).toContainEqual(['sid', '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'])
  expect(event.tags).toContainEqual(['ops', OpPost])
})

test('SubspaceOpEvent: should parse a raw event', () => {
  const rawEvent: NostrEvent = {
    kind: KindGovernancePost,
    content: 'Test content',
    created_at: 1234567890,
    tags: [
      ['d', 'subspace_op'],
      ['sid', '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'],
      ['ops', OpPost],
      ['content_type', 'text/plain'],
      ['parent', '213425955dc44ecd0d12a4af527ab66b71b1b77603a144c2581f8d32826d81ec'],
      ['proposal_id', 'proposal123'],
    ],
  }
  const event = NewSubspaceOpEvent(
    rawEvent.tags.find(tag => tag[0] === 'sid')?.[1] || '',
    rawEvent.kind,
    rawEvent.content,
  )

  expect(event.kind).toBe(rawEvent.kind)
  expect(event.operation).toBe(OpPost)
  expect(event.content).toBe(rawEvent.content)
  expect(event.tags).toContainEqual(['d', 'subspace_op'])
  expect(event.tags).toContainEqual(['sid', '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'])
  expect(event.tags).toContainEqual(['ops', OpPost])
})

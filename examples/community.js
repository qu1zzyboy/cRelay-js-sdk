import { finalizeEvent, generateSecretKey, getPublicKey } from '../lib/esm/pure.js'
import { Relay, useWebSocketImplementation } from '../lib/esm/relay.js'
import {
    NewSubspaceCreateEvent,
    ValidateSubspaceCreateEvent,
    NewSubspaceJoinEvent,
    ValidateSubspaceJoinEvent,
    toNostrEvent,
    setParents,
} from '../lib/esm/cip/subspace.js'
import {
    KindSubspaceCreate,
    DefaultCommonPrjOps,
    DefaultSubspaceOps,
    CommunitySubspaceOps,
} from '../lib/esm/cip/constants.js'
import {
    newCommunityCreateEvent,
    newCommunityInviteEvent,
    newChannelCreateEvent,
    newChannelMessageEvent,
    toNostrEvent as toNostrEventCommunity,
} from '../lib/esm/cip/cip07/community.js'
import WebSocket from 'ws'

useWebSocketImplementation(WebSocket)

// 0. Connect to the relay for test
const relayURL = 'ws://161.97.129.166:10547'
const relay = await Relay.connect(relayURL)
console.log(`connected to ${relay.url}`)

// Generate keys
let sk = generateSecretKey()
let pk = getPublicKey(sk)

// Subscribe to events
relay.subscribe(
    [
        {
            kinds: [KindSubspaceCreate],
            limit: 1,
        },
    ],
    {
        onevent(event) {
            console.log('====================================')
            console.log('Subscribe got event:', event)
        },
    },
)

// 1. Create a new subspace
const subspaceName = 'TestCommunity'
const rules = 'Community interaction space'
const description = 'A test subspace for community operations'
const imageURL = 'http://example.com/image.png'

const subspaceEvent = NewSubspaceCreateEvent(
    subspaceName,
    DefaultCommonPrjOps + ',' + DefaultSubspaceOps + ',' + CommunitySubspaceOps,
    rules,
    description,
    imageURL,
)
ValidateSubspaceCreateEvent(subspaceEvent)

// Sign and publish the subspace creation event
const signedSubspaceEvent = finalizeEvent(toNostrEvent(subspaceEvent), sk)
await relay.publish(signedSubspaceEvent)
console.log('====================================')
console.log('Subspace creation event published:', signedSubspaceEvent)

// 2. Join the subspace
const joinEvent = NewSubspaceJoinEvent(subspaceEvent.subspaceID, 'Join')
ValidateSubspaceJoinEvent(joinEvent)

// Sign and publish the subspace join event
const signedJoinEvent = finalizeEvent(toNostrEvent(joinEvent), sk)
await relay.publish(signedJoinEvent)
console.log('====================================')
console.log('Subspace join event published:', signedJoinEvent)

// 3. Create a community
const communityEvent = await newCommunityCreateEvent(subspaceEvent.subspaceID, '')
if (!communityEvent) {
    throw new Error('Failed to create community event')
}
communityEvent.setCommunityInfo('comm123', 'Tech Community', 'public')

// Sign and publish the community event
const signedCommunityEvent = finalizeEvent(toNostrEventCommunity(communityEvent), sk)
await relay.publish(signedCommunityEvent)
console.log('====================================')
console.log('Community event published:', signedCommunityEvent)

// 4. Create a community invite
const inviteEvent = await newCommunityInviteEvent(subspaceEvent.subspaceID, '')
if (!inviteEvent) {
    throw new Error('Failed to create invite event')
}
inviteEvent.setInviteInfo('comm123', pk, 'user456', 'direct')

// Sign and publish the invite event
const signedInviteEvent = finalizeEvent(toNostrEventCommunity(inviteEvent), sk)
await relay.publish(signedInviteEvent)
console.log('====================================')
console.log('Invite event published:', signedInviteEvent)

// 5. Create a channel
const channelEvent = await newChannelCreateEvent(subspaceEvent.subspaceID, '')
if (!channelEvent) {
    throw new Error('Failed to create channel event')
}
channelEvent.setChannelInfo('comm123', 'chan123', 'General', 'text')

// Sign and publish the channel event
const signedChannelEvent = finalizeEvent(toNostrEventCommunity(channelEvent), sk)
await relay.publish(signedChannelEvent)
console.log('====================================')
console.log('Channel event published:', signedChannelEvent)

// 6. Create a channel message
const messageEvent = await newChannelMessageEvent(subspaceEvent.subspaceID, '')
if (!messageEvent) {
    throw new Error('Failed to create message event')
}
messageEvent.setMessageInfo('chan123', pk, 'Welcome to the channel!', '')

// Sign and publish the message event
const signedMessageEvent = finalizeEvent(toNostrEventCommunity(messageEvent), sk)
await relay.publish(signedMessageEvent)
console.log('====================================')
console.log('Message event published:', signedMessageEvent)

relay.close() 
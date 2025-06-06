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
    SocialSubspaceOps,
} from '../lib/esm/cip/constants.js'
import {
    newLikeEvent,
    newCollectEvent,
    newShareEvent,
    newCommentEvent,
    newTagEvent,
    newFollowEvent,
    newUnfollowEvent,
    newQuestionEvent,
    newRoomEvent,
    newMessageInRoomEvent,
    toNostrEvent as toNostrEventSocial,
} from '../lib/esm/cip/cip06/social.js'
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
const subspaceName = 'TestSocial'
const rules = 'Social interaction space'
const description = 'A test subspace for social operations'
const imageURL = 'http://example.com/image.png'

const subspaceEvent = NewSubspaceCreateEvent(
    subspaceName,
    DefaultCommonPrjOps + ',' + DefaultSubspaceOps + ',' + SocialSubspaceOps,
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

// 3. Create a like event
const likeEvent = await newLikeEvent(subspaceEvent.subspaceID, '')
if (!likeEvent) {
    throw new Error('Failed to create like event')
}
likeEvent.setLikeInfo('post123', pk)

// Sign and publish the like event
const signedLikeEvent = finalizeEvent(toNostrEventSocial(likeEvent), sk)
await relay.publish(signedLikeEvent)
console.log('====================================')
console.log('Like event published:', signedLikeEvent)

// 4. Create a collect event
const collectEvent = await newCollectEvent(subspaceEvent.subspaceID, '')
if (!collectEvent) {
    throw new Error('Failed to create collect event')
}
collectEvent.setCollectInfo('post123', pk)

// Sign and publish the collect event
const signedCollectEvent = finalizeEvent(toNostrEventSocial(collectEvent), sk)
await relay.publish(signedCollectEvent)
console.log('====================================')
console.log('Collect event published:', signedCollectEvent)

// 5. Create a share event
const shareEvent = await newShareEvent(subspaceEvent.subspaceID, '')
if (!shareEvent) {
    throw new Error('Failed to create share event')
}
shareEvent.setShareInfo('post123', pk, 'twitter', 5)

// Sign and publish the share event
const signedShareEvent = finalizeEvent(toNostrEventSocial(shareEvent), sk)
await relay.publish(signedShareEvent)
console.log('====================================')
console.log('Share event published:', signedShareEvent)

// 6. Create a comment event
const commentEvent = await newCommentEvent(subspaceEvent.subspaceID, '')
if (!commentEvent) {
    throw new Error('Failed to create comment event')
}
commentEvent.setCommentInfo('post123', pk, '', 'This is a great post!')

// Sign and publish the comment event
const signedCommentEvent = finalizeEvent(toNostrEventSocial(commentEvent), sk)
await relay.publish(signedCommentEvent)
console.log('====================================')
console.log('Comment event published:', signedCommentEvent)

// 7. Create a tag event
const tagEvent = await newTagEvent(subspaceEvent.subspaceID, '')
if (!tagEvent) {
    throw new Error('Failed to create tag event')
}
tagEvent.setTagInfo('post123', 'technology')

// Sign and publish the tag event
const signedTagEvent = finalizeEvent(toNostrEventSocial(tagEvent), sk)
await relay.publish(signedTagEvent)
console.log('====================================')
console.log('Tag event published:', signedTagEvent)

// 8. Create a follow event
const followEvent = await newFollowEvent(subspaceEvent.subspaceID, '')
if (!followEvent) {
    throw new Error('Failed to create follow event')
}
followEvent.setFollowInfo(pk, 'user456')

// Sign and publish the follow event
const signedFollowEvent = finalizeEvent(toNostrEventSocial(followEvent), sk)
await relay.publish(signedFollowEvent)
console.log('====================================')
console.log('Follow event published:', signedFollowEvent)

// 9. Create an unfollow event
const unfollowEvent = await newUnfollowEvent(subspaceEvent.subspaceID, '')
if (!unfollowEvent) {
    throw new Error('Failed to create unfollow event')
}
unfollowEvent.setUnfollowInfo(pk, 'user456')

// Sign and publish the unfollow event
const signedUnfollowEvent = finalizeEvent(toNostrEventSocial(unfollowEvent), sk)
await relay.publish(signedUnfollowEvent)
console.log('====================================')
console.log('Unfollow event published:', signedUnfollowEvent)

// 10. Create a question event
const questionEvent = await newQuestionEvent(subspaceEvent.subspaceID, '')
if (!questionEvent) {
    throw new Error('Failed to create question event')
}
questionEvent.setQuestionInfo('post123', pk, 'What are your thoughts on this?', 'high')

// Sign and publish the question event
const signedQuestionEvent = finalizeEvent(toNostrEventSocial(questionEvent), sk)
await relay.publish(signedQuestionEvent)
console.log('====================================')
console.log('Question event published:', signedQuestionEvent)

// 11. Create a room event
const roomEvent = await newRoomEvent(subspaceEvent.subspaceID, '')
if (!roomEvent) {
    throw new Error('Failed to create room event')
}
roomEvent.setRoomInfo('General Discussion', 'A room for general discussions', [pk, 'user456'])

// Sign and publish the room event
const signedRoomEvent = finalizeEvent(toNostrEventSocial(roomEvent), sk)
await relay.publish(signedRoomEvent)
console.log('====================================')
console.log('Room event published:', signedRoomEvent)

// 12. Create a message in room event
const messageEvent = await newMessageInRoomEvent(subspaceEvent.subspaceID, '')
if (!messageEvent) {
    throw new Error('Failed to create message event')
}
messageEvent.setMessageInfo(signedRoomEvent.id, 'Hello everyone!', '', [pk])

// Sign and publish the message event
const signedMessageEvent = finalizeEvent(toNostrEventSocial(messageEvent), sk)
await relay.publish(signedMessageEvent)
console.log('====================================')
console.log('Message event published:', signedMessageEvent)

relay.close() 
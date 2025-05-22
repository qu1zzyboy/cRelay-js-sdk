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
    OpenResearchSubspaceOps,
} from '../lib/esm/cip/constants.js'
import {
    newPaperEvent,
    newAnnotationEvent,
    newReviewEvent,
    newAiAnalysisEvent,
    newDiscussionEvent,
    toNostrEvent as toNostrEventOpenResearch,
} from '../lib/esm/cip/cip05/openresearch.js'
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
const subspaceName = 'TestOpenResearch'
const rules = 'Open research collaboration space'
const description = 'A test subspace for open research operations'
const imageURL = 'http://example.com/image.png'

const subspaceEvent = NewSubspaceCreateEvent(
    subspaceName,
    DefaultCommonPrjOps + ',' + DefaultSubspaceOps + ',' + OpenResearchSubspaceOps,
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

// 3. Create a paper event
const paperEvent = await newPaperEvent(subspaceEvent.subspaceID, '')
if (!paperEvent) {
    throw new Error('Failed to create paper event')
}
paperEvent.setPaperInfo(
    '10.1234/example.2023',
    'research',
    ['John Doe', 'Jane Smith'],
    ['AI', 'Machine Learning', 'Research'],
    '2023',
    'Journal of Example Research',
    'Example Research Paper',
    'This is an example research paper abstract.',
    'https://example.com/paper',
    'abc123def456',
)

// Sign and publish the paper event
const signedPaperEvent = finalizeEvent(toNostrEventOpenResearch(paperEvent), sk)
await relay.publish(signedPaperEvent)
console.log('====================================')
console.log('Paper event published:', signedPaperEvent)

// 4. Create an annotation event
const annotationEvent = await newAnnotationEvent(subspaceEvent.subspaceID, '')
if (!annotationEvent) {
    throw new Error('Failed to create annotation event')
}
annotationEvent.setAnnotationInfo(
    signedPaperEvent.id,
    'section1',
    'comment',
    '',
    'This is an interesting point in the paper.',
)

// Sign and publish the annotation event
const signedAnnotationEvent = finalizeEvent(toNostrEventOpenResearch(annotationEvent), sk)
await relay.publish(signedAnnotationEvent)
console.log('====================================')
console.log('Annotation event published:', signedAnnotationEvent)

// 5. Create a review event
const reviewEvent = await newReviewEvent(subspaceEvent.subspaceID, '')
if (!reviewEvent) {
    throw new Error('Failed to create review event')
}
reviewEvent.setReviewInfo(
    signedPaperEvent.id,
    4.5,
    {
        methodology: 4.5,
        results: 4.0,
        discussion: 5.0,
    },
    'Overall, this is a well-written paper with strong methodology.',
    'Clear methodology, comprehensive literature review.',
    'Could use more discussion on limitations.',
    'Consider expanding the discussion section.',
)

// Sign and publish the review event
const signedReviewEvent = finalizeEvent(toNostrEventOpenResearch(reviewEvent), sk)
await relay.publish(signedReviewEvent)
console.log('====================================')
console.log('Review event published:', signedReviewEvent)

// 6. Create an AI analysis event
const aiAnalysisEvent = await newAiAnalysisEvent(subspaceEvent.subspaceID, '')
if (!aiAnalysisEvent) {
    throw new Error('Failed to create AI analysis event')
}
aiAnalysisEvent.setAiAnalysisInfo(
    'literature_review',
    [signedPaperEvent.id],
    'Analyze the key contributions and potential impact of this research.',
    'The paper presents significant contributions to the field...',
    [
        'Novel methodology for data analysis',
        'Strong experimental validation',
        'Clear practical applications',
    ],
    [
        'Extend the methodology to other domains',
        'Investigate scalability aspects',
        'Explore real-world deployment scenarios',
    ],
)

// Sign and publish the AI analysis event
const signedAiAnalysisEvent = finalizeEvent(toNostrEventOpenResearch(aiAnalysisEvent), sk)
await relay.publish(signedAiAnalysisEvent)
console.log('====================================')
console.log('AI analysis event published:', signedAiAnalysisEvent)

// 7. Create a discussion event
const discussionEvent = await newDiscussionEvent(subspaceEvent.subspaceID, '')
if (!discussionEvent) {
    throw new Error('Failed to create discussion event')
}
discussionEvent.setDiscussionInfo(
    'Research Impact',
    '',
    [signedPaperEvent.id],
    'Let\'s discuss the potential impact of this research on the field.',
)

// Sign and publish the discussion event
const signedDiscussionEvent = finalizeEvent(toNostrEventOpenResearch(discussionEvent), sk)
await relay.publish(signedDiscussionEvent)
console.log('====================================')
console.log('Discussion event published:', signedDiscussionEvent)

relay.close() 
import { finalizeEvent, generateSecretKey, getPublicKey } from '../lib/esm/pure.js';
import { Relay, useWebSocketImplementation } from '../lib/esm/relay.js';
import {
    NewSubspaceCreateEvent,
    ValidateSubspaceCreateEvent,
    NewSubspaceJoinEvent,
    ValidateSubspaceJoinEvent,
    toNostrEvent,
    setParents
} from '../lib/esm/cip/subspace.js';
import { KindSubspaceCreate, DefaultCommonPrjOps, DefaultSubspaceOps, ModelGraphSubspaceOps } from '../lib/esm/cip/constants.js'
import {
    newModelEvent,
    newDatasetEvent,
    newComputeEvent,
    newAlgoEvent,
    newValidEvent,
    newFinetuneEvent,
    newConversationEvent,
    newSessionEvent,
    toNostrEvent as toNostrEventModel
} from '../lib/esm/cip/cip03/modelgraph.js'
import WebSocket from 'ws';

useWebSocketImplementation(WebSocket);

// 0. Connect to the relay for test
const relayURL = 'ws://161.97.129.166:10547'
const relay = await Relay.connect(relayURL);
console.log(`connected to ${relay.url}`);

// Generate keys
let sk = generateSecretKey();
let pk = getPublicKey(sk);

// Subscribe to events
relay.subscribe([
    {
        kinds: [KindSubspaceCreate],
        limit: 1,
    },
], {
    onevent(event) {
        console.log('====================================');
        console.log('Subscribe got event:', event);
    }
})

// 1. Create a new subspace
const subspaceName = 'TestModelGraph';
const rules = 'rule1';
const description = 'This is a test subspace for model graph';
const imageURL = 'http://example.com/image.png';

const subspaceEvent = NewSubspaceCreateEvent(
    subspaceName,
    DefaultCommonPrjOps + "," + DefaultSubspaceOps + "," + ModelGraphSubspaceOps,
    rules,
    description,
    imageURL
);
ValidateSubspaceCreateEvent(subspaceEvent);

// Sign and publish the subspace creation event
const signedSubspaceEvent = finalizeEvent(toNostrEvent(subspaceEvent), sk);
await relay.publish(signedSubspaceEvent);
console.log('====================================');
console.log('Subspace creation event published:', signedSubspaceEvent);

// 2. Join the subspace
const joinEvent = NewSubspaceJoinEvent(subspaceEvent.subspaceID, "Join");
ValidateSubspaceJoinEvent(joinEvent);

// Sign and publish the subspace join event
const signedJoinEvent = finalizeEvent(toNostrEvent(joinEvent), sk);
await relay.publish(signedJoinEvent);
console.log('====================================');
console.log('Subspace join event published:', signedJoinEvent);

// 3. Create a model
const modelEvent = await newModelEvent(subspaceEvent.subspaceID, "Create a new model")
if (!modelEvent) {
    throw new Error('Failed to create model event')
}
modelEvent.setParent('parent-hash-123')
modelEvent.setContributions('0.5,0.3,0.2')

// Sign and publish the model event
const signedModelEvent = finalizeEvent(toNostrEventModel(modelEvent), sk);
await relay.publish(signedModelEvent);
console.log('====================================');
console.log('Model event published:', signedModelEvent);

// 4. Create a dataset
const datasetEvent = await newDatasetEvent(subspaceEvent.subspaceID, "Create a new dataset")
if (!datasetEvent) {
    throw new Error('Failed to create dataset event')
}
datasetEvent.setDatasetInfo(
    'proj-001',
    'task-001',
    'training',
    'json',
    ['user1', 'user2']
)

// Sign and publish the dataset event
const signedDatasetEvent = finalizeEvent(toNostrEventModel(datasetEvent), sk);
await relay.publish(signedDatasetEvent);
console.log('====================================');
console.log('Dataset event published:', signedDatasetEvent);

// 5. Create a compute event
const computeEvent = await newComputeEvent(subspaceEvent.subspaceID, "Create a new compute event")
if (!computeEvent) {
    throw new Error('Failed to create compute event')
}
computeEvent.setComputeType('gpu')

// Sign and publish the compute event
const signedComputeEvent = finalizeEvent(toNostrEventModel(computeEvent), sk);
await relay.publish(signedComputeEvent);
console.log('====================================');
console.log('Compute event published:', signedComputeEvent);

// 6. Create an algo event
const algoEvent = await newAlgoEvent(subspaceEvent.subspaceID, "Create a new algo event")
if (!algoEvent) {
    throw new Error('Failed to create algo event')
}
algoEvent.setAlgoType('gradient-descent')

// Sign and publish the algo event
const signedAlgoEvent = finalizeEvent(toNostrEventModel(algoEvent), sk);
await relay.publish(signedAlgoEvent);
console.log('====================================');
console.log('Algo event published:', signedAlgoEvent);

// 7. Create a valid event
const validEvent = await newValidEvent(subspaceEvent.subspaceID, "Create a new valid event")
if (!validEvent) {
    throw new Error('Failed to create valid event')
}
validEvent.setValidResult('accuracy=0.95')

// Sign and publish the valid event
const signedValidEvent = finalizeEvent(toNostrEventModel(validEvent), sk);
await relay.publish(signedValidEvent);
console.log('====================================');
console.log('Valid event published:', signedValidEvent);

// 8. Create a finetune event
const finetuneEvent = await newFinetuneEvent(subspaceEvent.subspaceID, "Create a new finetune event")
if (!finetuneEvent) {
    throw new Error('Failed to create finetune event')
}
finetuneEvent.setFinetuneInfo(
    'proj-001',
    'task-001',
    'dataset-001',
    'provider-001',
    'gpt-3.5'
)

// Sign and publish the finetune event
const signedFinetuneEvent = finalizeEvent(toNostrEventModel(finetuneEvent), sk);
await relay.publish(signedFinetuneEvent);
console.log('====================================');
console.log('Finetune event published:', signedFinetuneEvent);

// 9. Create a conversation event
const conversationEvent = await newConversationEvent(subspaceEvent.subspaceID, "Create a new conversation event")
if (!conversationEvent) {
    throw new Error('Failed to create conversation event')
}
conversationEvent.setConversationInfo(
    'session-001',
    'user-001',
    'model-001',
    Date.now().toString(),
    'interaction-hash-123'
)

// Sign and publish the conversation event
const signedConversationEvent = finalizeEvent(toNostrEventModel(conversationEvent), sk);
await relay.publish(signedConversationEvent);
console.log('====================================');
console.log('Conversation event published:', signedConversationEvent);

// 10. Create a session event
const sessionEvent = await newSessionEvent(subspaceEvent.subspaceID, "Create a new session event")
if (!sessionEvent) {
    throw new Error('Failed to create session event')
}
const startTime = Date.now()
const endTime = startTime + 3600000 // 1 hour later
sessionEvent.setSessionInfo(
    'session-001',
    'start',
    'user-001',
    startTime.toString(),
    endTime.toString()
)

// Sign and publish the session event
const signedSessionEvent = finalizeEvent(toNostrEventModel(sessionEvent), sk);
await relay.publish(signedSessionEvent);
console.log('====================================');
console.log('Session event published:', signedSessionEvent);

relay.close(); 
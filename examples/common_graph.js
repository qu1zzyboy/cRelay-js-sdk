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
import { KindSubspaceCreate, DefaultCommonPrjOps, DefaultCommonGraphOps } from '../lib/esm/cip/constants.js'
import {
    newProjectEvent,
    newTaskEvent,
    newEntityEvent,
    newRelationEvent,
    newObservationEvent,
    toNostrEvent as toNostrEventCommon
} from '../lib/esm/cip/cip02/common_graph.js'
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
const subspaceName = 'TestCommonGraph';
const rules = 'rule1';
const description = 'This is a test subspace for common graph';
const imageURL = 'http://example.com/image.png';

const subspaceEvent = NewSubspaceCreateEvent(subspaceName, DefaultCommonPrjOps + "," + DefaultCommonGraphOps, rules, description, imageURL);
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

// 3. Create a project
const projectEvent = await newProjectEvent(subspaceEvent.subspaceID, "Create a new project")
if (!projectEvent) {
    throw new Error('Failed to create project event')
}
projectEvent.setProjectInfo(
    'proj-001',
    'Test Project',
    'This is a test project',
    ['user1', 'user2'],
    'active'
)

// Sign and publish the project event
const signedProjectEvent = finalizeEvent(toNostrEventCommon(projectEvent), sk);
await relay.publish(signedProjectEvent);
console.log('====================================');
console.log('Project event published:', signedProjectEvent);

// 4. Create a task
const taskEvent = await newTaskEvent(subspaceEvent.subspaceID, "Create a new task")
if (!taskEvent) {
    throw new Error('Failed to create task event')
}
taskEvent.setTaskInfo(
    'proj-001',
    'task-001',
    'Implement feature X',
    'user1',
    'in-progress',
    '2024-12-31',
    'high'
)

// Sign and publish the task event
const signedTaskEvent = finalizeEvent(toNostrEventCommon(taskEvent), sk);
await relay.publish(signedTaskEvent);
console.log('====================================');
console.log('Task event published:', signedTaskEvent);

// 5. Create an entity
const entityEvent = await newEntityEvent(subspaceEvent.subspaceID, "Create a new entity")
if (!entityEvent) {
    throw new Error('Failed to create entity event')
}
entityEvent.setEntityInfo('User', 'Person')

// Sign and publish the entity event
const signedEntityEvent = finalizeEvent(toNostrEventCommon(entityEvent), sk);
await relay.publish(signedEntityEvent);
console.log('====================================');
console.log('Entity event published:', signedEntityEvent);

// 6. Create a relation
const relationEvent = await newRelationEvent(subspaceEvent.subspaceID, "Create a new relation")
if (!relationEvent) {
    throw new Error('Failed to create relation event')
}
relationEvent.setRelationInfo(
    'user1',
    'user2',
    'follows',
    'social',
    0.85,
    'Strong professional relationship with regular interactions'
)

// Sign and publish the relation event
const signedRelationEvent = finalizeEvent(toNostrEventCommon(relationEvent), sk);
await relay.publish(signedRelationEvent);
console.log('====================================');
console.log('Relation event published:', signedRelationEvent);

// 7. Create an observation
const observationEvent = await newObservationEvent(subspaceEvent.subspaceID, "Create a new observation")
if (!observationEvent) {
    throw new Error('Failed to create observation event')
}
observationEvent.setObservationInfo('user1', 'User is active')

// Sign and publish the observation event
const signedObservationEvent = finalizeEvent(toNostrEventCommon(observationEvent), sk);
await relay.publish(signedObservationEvent);
console.log('====================================');
console.log('Observation event published:', signedObservationEvent);

relay.close(); 
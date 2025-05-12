import { finalizeEvent, finalizeEventBySig, generateSecretKey, getPublicKey, serializeEvent } from '../lib/esm/pure.js';
import { Relay, useWebSocketImplementation } from '../lib/esm/relay.js';
import {
  NewSubspaceCreateEvent,
  ValidateSubspaceCreateEvent,
  NewSubspaceJoinEvent,
  ValidateSubspaceJoinEvent,
  toNostrEvent,
  setParents
} from '../lib/esm/cip/subspace.js';
import { KindSubspaceCreate, DefaultSubspaceOps } from '../lib/esm/cip/constants.js'
import { newPostEvent, newVoteEvent, newMintEvent, toNostrEvent as toNostrEventGov, newProposeEvent } from '../lib/esm/cip/cip01/governance.js'
import WebSocket from 'ws';

useWebSocketImplementation(WebSocket);

// 0. Connect to the relay for test
// const relayURL = 'ws://127.0.0.1:10547'
// const relayURL = 'ws://161.97.129.166:10547'
const relayURL = 'wss://events.teeml.ai'

const relay = await Relay.connect(relayURL);
console.log(`connected to ${relay.url}`);

// Generate keys
let sk = generateSecretKey();
let pk = getPublicKey(sk);

// Subscribe to events
// This will listen for subspace creation events from the specified public key
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
const subspaceName = 'TestSubspace';
const rules = 'rule1';
const description = 'This is a test subspace';
const imageURL = 'http://example.com/image.png';

const subspaceEvent = NewSubspaceCreateEvent(subspaceName, DefaultSubspaceOps, rules, description, imageURL);
ValidateSubspaceCreateEvent(subspaceEvent);

// Sign and publish the subspace creation event
// Or use finalizeEventBySig to support 3rd signature
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

// 3. Perform an operation in the subspace(Post)
const postEvent = await newPostEvent(subspaceEvent.subspaceID, "post")
if (!postEvent) {
  throw new Error('Failed to create post event')
}
postEvent.setContentType('text/plain')
setParents(postEvent.SubspaceOpEvent, ['213425955dc44ecd0d12a4af527ab66b71b1b77603a144c2581f8d32826d81ec'])

// Sign and publish the subspace operation event
const signedOpPostEvent = finalizeEvent(toNostrEventGov(postEvent), sk);
await relay.publish(signedOpPostEvent);
console.log('====================================');
console.log('Subspace operation [post] event published:', signedOpPostEvent);

// 3. Perform an operation in the subspace(proposer)
const proposerEvent = await newProposeEvent(subspaceEvent.subspaceID, "proposer")
if (!proposerEvent) {
  throw new Error('Failed to create proposer event')
}
proposerEvent.setProposal('proposer-1')
setParents(proposerEvent.SubspaceOpEvent, ['213425955dc44ecd0d12a4af527ab66b71b1b77603a144c2581f8d32826d81ec'])

// Sign and publish the subspace operation event
const signedOpProposalEvent = finalizeEvent(toNostrEventGov(proposerEvent), sk);
await relay.publish(signedOpProposalEvent);
console.log('====================================');
console.log('Subspace operation [proposal] event published:', signedOpProposalEvent);

// 4. Perform an operation in the subspace(Vote)
const voteEvent = await newVoteEvent(subspaceEvent.subspaceID, "vote")
if (!voteEvent) {
  throw new Error('Failed to create vote event')
}
voteEvent.setVote('213425955dc44ecd0d12a4af527ab66b71b1b77603a144c2581f8d32826d81ec', "yes")

// Sign and publish the subspace operation event
const signedOpVoteEvent = finalizeEvent(toNostrEventGov(voteEvent), sk);
await relay.publish(signedOpVoteEvent);
console.log('====================================');
console.log('Subspace operation [vote] event published:', signedOpVoteEvent);

// 5. Perform an operation in the subspace(Mint)
const mintEvent = await newMintEvent(subspaceEvent.subspaceID, "mint token")
if (!mintEvent) {
  throw new Error('Failed to create mint event')
}
mintEvent.setTokenInfo('Community Token', 'CTK', '18')
mintEvent.setMintDetails('1000', '30300:2,30301:2,30302:1,30303:3,30304:10')

// Sign and publish the subspace mint event
const signedOpMintEvent = finalizeEvent(toNostrEventGov(mintEvent), sk);
await relay.publish(signedOpMintEvent);
console.log('====================================');
console.log('Subspace operation [mint] event published:', signedOpMintEvent);

relay.close();
## cRelay-js-sdk

This project serves as the official Javascript SDK for [CausalityGraph](https://github.com/hetu-project/causalitygraph), providing a robust implementation of the Nostr protocol with advanced causality tracking and secure messaging capabilities. It is designed to be the primary development toolkit for building decentralized applications that require strong causality guarantees and secure communication.

It combines three key technologies:

1. Nostr (decentralized messaging protocol) and [CIP](https://github.com/hetu-project/causalitygraph/tree/main/Key) (Causality Implementation Possibilities)
2. Ethereum EIP-191 signatures (secure cryptographic signing)
3. VLC (Verifiable Logical Clock)

## Installation

```bash
# bun
curl -fsSL https://bun.sh/install | bash

# install just for linux
curl -LO https://github.com/casey/just/releases/download/1.28.0/just-1.28.0-x86_64-unknown-linux-musl.tar.gz
tar -xvf just-1.28.0-x86_64-unknown-linux-musl.tar.gz
sudo mv just /usr/local/bin/

# or for macOS
brew install just

# compile by yourself
just build

# or install by npm
npm i @ai-chen2050/crelay-js-sdk

# jsr
npx jsr add @ai-chen2050/crelay-js-sdk
```

If using TypeScript, this package requires TypeScript >= 5.0.

## CIP Implementation

The `cip` directory implements various CIP (Common Interface Protocol) specifications:

### CIP-01: Basic Subspace Operations
- Subspace creation and management
- Basic event operations
- Authentication and authorization

### CIP-02: Common Graph Operations
- Project and task management
- Entity and relation tracking
- Observation recording
- Structured data organization

### CIP-03: Model Graph Operations
- Model versioning and tracking
- Dataset management
- Compute and algorithm operations
- Validation and fine-tuning
- Conversation and session handling

### CIP-04: OpenResearch Operations
- Research paper submission and indexing
- Paper annotations and reviews
- AI analysis integration
- Research discussions
- Academic collaboration features

Each CIP implementation follows a consistent pattern:
- Event type definitions
- Tag structure specifications
- Event creation and parsing
- Subspace operation management

## Examples

For detailed examples, please refer to the following files in the `examples` directory:

### [Subspace Operations](examples/subspace.js)
Basic subspace creation and management:
```javascript
// Create and join a subspace
const subspaceEvent = NewSubspaceCreateEvent(
  subspaceName,
  DefaultCommonPrjOps + ',' + DefaultSubspaceOps,
  rules,
  description,
  imageURL,
)
ValidateSubspaceCreateEvent(subspaceEvent)

const joinEvent = NewSubspaceJoinEvent(subspaceEvent.subspaceID, 'Join')
ValidateSubspaceJoinEvent(joinEvent)
```

### [Common Operations](examples/common_graph.js)
Project, task, entity, and relation management:
```javascript
// Create a project
const projectEvent = await newProjectEvent(subspaceID, '')
projectEvent.setProjectInfo(
  'proj-001',
  'Test Project',
  'This is a test project',
  ['user1', 'user2'],
  'active',
)

// Create a task
const taskEvent = await newTaskEvent(subspaceID, '')
taskEvent.setTaskInfo(
  'proj-001',
  'task-001',
  'Test Task',
  'user1',
  'in_progress',
  '2024-12-31',
  'high',
)
```

### [Model Graph Operations](examples/modelgraph.js)
Model, dataset, and training management:
```javascript
// Create a model
const modelEvent = await newModelEvent(subspaceID, '')
modelEvent.setParent('parent-hash-123')
modelEvent.setContributions('0.5,0.3,0.2')

// Create a dataset
const datasetEvent = await newDatasetEvent(subspaceID, '')
datasetEvent.setDatasetInfo(
  'proj-001',
  'task-001',
  'training',
  'json',
  ['user1', 'user2'],
)
```

### [OpenResearch Operations](examples/openresearch.js)
Research paper and collaboration management:
```javascript
// Create a paper
const paperEvent = await newPaperEvent(subspaceID, '')
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

// Create a review
const reviewEvent = await newReviewEvent(subspaceID, '')
reviewEvent.setReviewInfo(
  paperEvent.id,
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
```

Each example demonstrates the core functionality of its respective CIP implementation. For complete working examples including relay connection, event signing, and publishing, please refer to the corresponding files in the `examples` directory.

## Plumbing

To develop `cRelay-js-sdk`, install [`just`](https://just.systems/) and run `just -l` to see commands available.

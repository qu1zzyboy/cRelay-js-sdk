// Subspace common event kinds
export const KindSubspaceCreate = 30100
export const KindSubspaceJoin = 30200

// Governance event kinds
export const KindGovernancePost = 30300
export const KindGovernancePropose = 30301
export const KindGovernanceVote = 30302
export const KindGovernanceInvite = 30303

// Modelgraph event kind
export const KindModelgraphModel = 30304
export const KindModelgraphData = 30305
export const KindModelgraphCompute = 30306
export const KindModelgraphAlgo = 30307
export const KindModelgraphValid = 30308

// General base operation types
export const OpSubspaceCreate = 'subspace_create' // 30100
export const OpSubspaceJoin = 'subspace_join' // 30200

// Governance operation types (governance operations)
export const OpPost = 'post' // 30300
export const OpPropose = 'propose' // 30301
export const OpVote = 'vote' // 30302
export const OpInvite = 'invite' // 30303

// Business operation types
export const OpModel = 'model' // 30304
export const OpData = 'data' // 30305
export const OpCompute = 'compute' // 30306
export const OpAlgo = 'algo' // 30307
export const OpValid = 'valid' // 30308

// Default operations string for subspace creation
export const DefaultSubspaceOps = 'post=30300,propose=30301,vote=30302,invite=30303' // Ensure consistent formatting

// Modelgraph operations string for subspace creation
export const ModelGraphSubspaceOps = 'model=30304,data=30305,compute=30306,algo=30307,valid=30308' // Ensure consistent formatting

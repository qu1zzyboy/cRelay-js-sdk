// Subspace common event kinds
export const KindSubspaceCreate = 30100
export const KindSubspaceJoin = 30200

// Governance event kinds
export const KindGovernancePost = 30300
export const KindGovernancePropose = 30301
export const KindGovernanceVote = 30302
export const KindGovernanceInvite = 30303
export const KindGovernanceMint = 30304

// Modelgraph event kind
export const KindModelgraphModel = 30404
export const KindModelgraphData = 30405
export const KindModelgraphCompute = 30406
export const KindModelgraphAlgo = 30407
export const KindModelgraphValid = 30408

// General base operation types
export const OpSubspaceCreate = 'subspace_create' // 30100
export const OpSubspaceJoin = 'subspace_join' // 30200

// Governance operation types (governance operations)
export const OpPost = 'post' // 30300
export const OpPropose = 'propose' // 30301
export const OpVote = 'vote' // 30302
export const OpInvite = 'invite' // 30303
export const OpMint = 'mint' // 30304

// Business operation types
export const OpModel = 'model' // 30404
export const OpData = 'data' // 30405
export const OpCompute = 'compute' // 30406
export const OpAlgo = 'algo' // 30407
export const OpValid = 'valid' // 30408

// Default operations string for subspace creation
export const DefaultSubspaceOps = 'post=30300,propose=30301,vote=30302,invite=30303,mint=30304' // Ensure consistent formatting

// Modelgraph operations string for subspace creation
export const ModelGraphSubspaceOps = 'model=30404,data=30405,compute=30406,algo=30407,valid=30408' // Ensure consistent formatting

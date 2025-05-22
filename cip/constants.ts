// Subspace common event kinds
export const KindSubspaceCreate = 30100
export const KindSubspaceJoin = 30200

// CommonGraph event kinds
export const KindCommonGraphProject = 30101
export const KindCommonGraphTask = 30102
export const KindCommonGraphEntity = 30103
export const KindCommonGraphRelation = 30104
export const KindCommonGraphObservation = 30105

// Governance event kinds
export const KindGovernancePost = 30300
export const KindGovernancePropose = 30301
export const KindGovernanceVote = 30302
export const KindGovernanceInvite = 30303
export const KindGovernanceMint = 30304

// Modelgraph event kinds
export const KindModelgraphModel = 30404
export const KindModelgraphDataset = 30405
export const KindModelgraphCompute = 30406
export const KindModelgraphAlgo = 30407
export const KindModelgraphValid = 30408
export const KindModelgraphFinetune = 30409
export const KindModelgraphConversation = 30410
export const KindModelgraphSession = 30411

// OpenResearch event kinds
export const KindOpenresearchPaper = 30501
export const KindOpenresearchAnnotation = 30502
export const KindOpenresearchReview = 30503
export const KindOpenresearchAiAnalysis = 30504
export const KindOpenresearchDiscussion = 30505

// General base operation types
export const OpSubspaceCreate = 'subspace_create' // 30100
export const OpSubspaceJoin = 'subspace_join' // 30200

// CommonGraph operation types
export const OpProject = 'project' // 30101
export const OpTask = 'task' // 30102
export const OpEntity = 'entity' // 30103
export const OpRelation = 'relation' // 30104
export const OpObservation = 'observation' // 30105

// Governance operation types (governance operations)
export const OpPost = 'post' // 30300
export const OpPropose = 'propose' // 30301
export const OpVote = 'vote' // 30302
export const OpInvite = 'invite' // 30303
export const OpMint = 'mint' // 30304

// Business operation types
export const OpModel = 'model' // 30404
export const OpDataset = 'dataset' // 30405
export const OpCompute = 'compute' // 30406
export const OpAlgo = 'algo' // 30407
export const OpValid = 'valid' // 30408
export const OpFinetune = 'finetune' // 30409
export const OpConversation = 'conversation' // 30410
export const OpSession = 'session' // 30411

// OpenResearch operation types
export const OpPaper = 'paper' // 30501
export const OpAnnotation = 'annotation' // 30502
export const OpReview = 'review' // 30503
export const OpAiAnalysis = 'ai_analysis' // 30504
export const OpDiscussion = 'discussion' // 30505

// Default common project actions
export const DefaultCommonPrjOps = 'project=30101,task=30102'

// Default common graph actions
export const DefaultCommonGraphOps = 'entity=30103,relation=30104,observation=30105'

// Default operations string for subspace creation
export const DefaultSubspaceOps = 'post=30300,propose=30301,vote=30302,invite=30303,mint=30304' // Ensure consistent formatting

// Modelgraph operations string for subspace creation
export const ModelGraphSubspaceOps =
  'model=30404,dataset=30405,compute=30406,algo=30407,valid=30408,finetune=30409,conversation=30410,session=30411' // Ensure consistent formatting

// OpenResearch operations string for subspace creation
export const OpenResearchSubspaceOps = 'paper=30501,annotation=30502,review=30503,ai_analysis=30504,discussion=30505' // Ensure consistent formatting
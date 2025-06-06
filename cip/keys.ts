import * as constants from './constants.ts' // Fixed import statement

// KeyOpMap maps kind values to operation names
export const KeyOpMap: { [key: number]: string } = {
  // Subspace common operations
  [constants.KindSubspaceCreate]: constants.OpSubspaceCreate,
  [constants.KindSubspaceJoin]: constants.OpSubspaceJoin,

  // CommonGraph operations
  [constants.KindCommonGraphProject]: constants.OpProject,
  [constants.KindCommonGraphTask]: constants.OpTask,
  [constants.KindCommonGraphEntity]: constants.OpEntity,
  [constants.KindCommonGraphRelation]: constants.OpRelation,
  [constants.KindCommonGraphObservation]: constants.OpObservation,

  // Governance operations
  [constants.KindGovernancePost]: constants.OpPost,
  [constants.KindGovernancePropose]: constants.OpPropose,
  [constants.KindGovernanceVote]: constants.OpVote,
  [constants.KindGovernanceInvite]: constants.OpInvite,
  [constants.KindGovernanceMint]: constants.OpMint,

  // ModelGraph operations
  [constants.KindModelgraphModel]: constants.OpModel,
  [constants.KindModelgraphDataset]: constants.OpDataset,
  [constants.KindModelgraphCompute]: constants.OpCompute,
  [constants.KindModelgraphAlgo]: constants.OpAlgo,
  [constants.KindModelgraphValid]: constants.OpValid,
  [constants.KindModelgraphFinetune]: constants.OpFinetune,
  [constants.KindModelgraphConversation]: constants.OpConversation,
  [constants.KindModelgraphSession]: constants.OpSession,

  // OpenResearch operations
  [constants.KindOpenresearchPaper]: constants.OpPaper,
  [constants.KindOpenresearchAnnotation]: constants.OpAnnotation,
  [constants.KindOpenresearchReview]: constants.OpReview,
  [constants.KindOpenresearchAiAnalysis]: constants.OpAiAnalysis,
  [constants.KindOpenresearchDiscussion]: constants.OpDiscussion,
  [constants.KindOpenresearchReadPaper]: constants.OpReadPaper,
  [constants.KindOpenresearchCoCreatePaper]: constants.OpCoCreatePaper,

  // Social Actions operations
  [constants.KindSocialLike]: constants.OpLike,
  [constants.KindSocialCollect]: constants.OpCollect,
  [constants.KindSocialShare]: constants.OpShare,
  [constants.KindSocialComment]: constants.OpComment,
  [constants.KindSocialTag]: constants.OpTag,
  [constants.KindSocialFollow]: constants.OpFollow,
  [constants.KindSocialUnfollow]: constants.OpUnfollow,
  [constants.KindSocialQuestion]: constants.OpQuestion,
  [constants.KindSocialRoom]: constants.OpRoom,
  [constants.KindSocialMessageInRoom]: constants.OpMessageInRoom,

  // Community Actions operations
  [constants.KindCommunityCreate]: constants.OpCommunityCreate,
  [constants.KindCommunityInvite]: constants.OpCommunityInvite,
  [constants.KindCommunityChannelCreate]: constants.OpChannelCreate,
  [constants.KindCommunityChannelMessage]: constants.OpChannelMessage,
}

// GetOpFromKind returns the operation name for a given kind value
export function getOpFromKind(kind: number): [string | undefined, boolean] {
  const op = KeyOpMap[kind]
  return [op, op !== undefined]
}

// GetKindFromOp returns the kind value for a given operation name
export function getKindFromOp(op: string): [number, boolean] {
  for (const kind in KeyOpMap) {
    if (KeyOpMap[kind] === op) {
      return [Number(kind), true]
    }
  }
  return [0, false]
}

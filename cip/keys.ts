import * as constants from './constants.ts' // Fixed import statement

// KeyOpMap maps kind values to operation names
export const KeyOpMap: { [key: number]: string } = {
  // common operations
  [constants.KindSubspaceCreate]: constants.OpSubspaceCreate,
  [constants.KindSubspaceJoin]: constants.OpSubspaceJoin,

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

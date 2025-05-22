import { SubspaceOpEvent, NostrEvent, Tags, NewSubspaceOpEvent, setParents } from '../subspace.ts'
import { getOpFromKind } from '../keys.ts'
import { AuthTag } from '../auth.ts'
import {
  KindOpenresearchPaper,
  KindOpenresearchAnnotation,
  KindOpenresearchReview,
  KindOpenresearchAiAnalysis,
  KindOpenresearchDiscussion,
  OpPaper,
  OpAnnotation,
  OpReview,
  OpAiAnalysis,
  OpDiscussion,
} from '../constants.ts'

// PaperEvent represents a paper operation in openresearch
class PaperEvent {
  SubspaceOpEvent: SubspaceOpEvent
  DOI: string
  PaperType: string
  Authors: string[]
  Keywords: string[]
  Year: string
  Journal: string
  Title: string
  Abstract: string
  URL: string
  FileHash: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.DOI = ''
    this.PaperType = ''
    this.Authors = []
    this.Keywords = []
    this.Year = ''
    this.Journal = ''
    this.Title = ''
    this.Abstract = ''
    this.URL = ''
    this.FileHash = ''
  }

  // SetPaperInfo sets the paper information
  setPaperInfo(
    doi: string,
    paperType: string,
    authors: string[],
    keywords: string[],
    year: string,
    journal: string,
    title: string,
    abstract: string,
    url: string,
    fileHash: string,
  ) {
    this.DOI = doi
    this.PaperType = paperType
    this.Authors = authors
    this.Keywords = keywords
    this.Year = year
    this.Journal = journal
    this.Title = title
    this.Abstract = abstract
    this.URL = url
    this.FileHash = fileHash

    this.SubspaceOpEvent.tags.push(['doi', doi], ['paper_type', paperType], ['year', year], ['journal', journal])

    if (authors.length > 0) {
      this.SubspaceOpEvent.tags.push(['authors', ...authors])
    }

    if (keywords.length > 0) {
      this.SubspaceOpEvent.tags.push(['keywords', ...keywords])
    }

    this.SubspaceOpEvent.content = JSON.stringify({
      title,
      abstract,
      url,
      file_hash: fileHash,
    })
  }
}

// AnnotationEvent represents an annotation operation in openresearch
class AnnotationEvent {
  SubspaceOpEvent: SubspaceOpEvent
  PaperID: string
  Position: string
  Type: string
  ParentID: string
  Content: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.PaperID = ''
    this.Position = ''
    this.Type = ''
    this.ParentID = ''
    this.Content = ''
  }

  // SetAnnotationInfo sets the annotation information
  setAnnotationInfo(paperID: string, position: string, type: string, parentID: string, content: string) {
    this.PaperID = paperID
    this.Position = position
    this.Type = type
    this.ParentID = parentID
    this.Content = content

    this.SubspaceOpEvent.tags.push(['paper_id', paperID], ['position', position], ['type', type])

    if (parentID) {
      this.SubspaceOpEvent.tags.push(['parent', parentID])
    }

    this.SubspaceOpEvent.content = content
  }
}

// ReviewEvent represents a review operation in openresearch
class ReviewEvent {
  SubspaceOpEvent: SubspaceOpEvent
  PaperID: string
  Rating: number
  Aspects: Record<string, number>
  Summary: string
  Strengths: string
  Weaknesses: string
  Recommendations: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.PaperID = ''
    this.Rating = 0
    this.Aspects = {}
    this.Summary = ''
    this.Strengths = ''
    this.Weaknesses = ''
    this.Recommendations = ''
  }

  // SetReviewInfo sets the review information
  setReviewInfo(
    paperID: string,
    rating: number,
    aspects: Record<string, number>,
    summary: string,
    strengths: string,
    weaknesses: string,
    recommendations: string,
  ) {
    this.PaperID = paperID
    this.Rating = rating
    this.Aspects = aspects
    this.Summary = summary
    this.Strengths = strengths
    this.Weaknesses = weaknesses
    this.Recommendations = recommendations

    this.SubspaceOpEvent.tags.push(
      ['paper_id', paperID],
      ['rating', rating.toString()],
      [
        'aspects',
        Object.entries(aspects)
          .map(([k, v]) => `${k}:${v}`)
          .join(','),
      ],
    )

    this.SubspaceOpEvent.content = JSON.stringify({
      summary,
      strengths,
      weaknesses,
      recommendations,
    })
  }
}

// AiAnalysisEvent represents an AI analysis operation in openresearch
class AiAnalysisEvent {
  SubspaceOpEvent: SubspaceOpEvent
  AnalysisType: string
  PaperIDs: string[]
  Prompt: string
  AnalysisResult: string
  KeyInsights: string[]
  PotentialDirections: string[]

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.AnalysisType = ''
    this.PaperIDs = []
    this.Prompt = ''
    this.AnalysisResult = ''
    this.KeyInsights = []
    this.PotentialDirections = []
  }

  // SetAiAnalysisInfo sets the AI analysis information
  setAiAnalysisInfo(
    analysisType: string,
    paperIDs: string[],
    prompt: string,
    analysisResult: string,
    keyInsights: string[],
    potentialDirections: string[],
  ) {
    this.AnalysisType = analysisType
    this.PaperIDs = paperIDs
    this.Prompt = prompt
    this.AnalysisResult = analysisResult
    this.KeyInsights = keyInsights
    this.PotentialDirections = potentialDirections

    this.SubspaceOpEvent.tags.push(['analysis_type', analysisType], ['prompt', prompt])

    if (paperIDs.length > 0) {
      this.SubspaceOpEvent.tags.push(['paper_ids', ...paperIDs])
    }

    this.SubspaceOpEvent.content = JSON.stringify({
      analysis_result: analysisResult,
      key_insights: keyInsights,
      potential_directions: potentialDirections,
    })
  }
}

// DiscussionEvent represents a discussion operation in openresearch
class DiscussionEvent {
  SubspaceOpEvent: SubspaceOpEvent
  Topic: string
  ParentID: string
  References: string[]
  Content: string

  constructor(subspaceOpEvent: SubspaceOpEvent) {
    this.SubspaceOpEvent = subspaceOpEvent
    this.Topic = ''
    this.ParentID = ''
    this.References = []
    this.Content = ''
  }

  // SetDiscussionInfo sets the discussion information
  setDiscussionInfo(topic: string, parentID: string, references: string[], content: string) {
    this.Topic = topic
    this.ParentID = parentID
    this.References = references
    this.Content = content

    this.SubspaceOpEvent.tags.push(['topic', topic])

    if (parentID) {
      this.SubspaceOpEvent.tags.push(['parent', parentID])
    }

    if (references.length > 0) {
      this.SubspaceOpEvent.tags.push(['references', ...references])
    }

    this.SubspaceOpEvent.content = content
  }
}

// Function to convert Subspace events to Nostr Event
export function toNostrEvent(
  event: PaperEvent | AnnotationEvent | ReviewEvent | AiAnalysisEvent | DiscussionEvent,
): NostrEvent {
  const tags: Tags = event.SubspaceOpEvent.tags

  return {
    created_at: event.SubspaceOpEvent.createdAt,
    kind: event.SubspaceOpEvent.kind,
    tags,
    content: event.SubspaceOpEvent.content,
  }
}

// ParseOpenResearchEvent parses a Nostr event into an openresearch event
function parseOpenResearchEvent(evt: NostrEvent): [SubspaceOpEvent | null, Error | null] {
  let subspaceID = ''
  let authTag: AuthTag | undefined
  let parentHash: string[] = []

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'sid':
        subspaceID = tag[1]
        break
      case 'auth':
        try {
          authTag = AuthTag.parseAuthTag(tag[1])
        } catch (err) {
          return [null, new Error(`failed to parse auth tag: ${err}`)]
        }
        break
      case 'parent':
        parentHash = tag.slice(1)
    }
  }

  // Get operation from kind
  const [operation, exists] = getOpFromKind(evt.kind)
  if (!exists) {
    return [null, new Error(`unknown kind value: ${evt.kind}`)]
  }

  // Parse based on operation type
  switch (operation as string) {
    case OpPaper:
      return parsePaperEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpAnnotation:
      return parseAnnotationEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpReview:
      return parseReviewEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpAiAnalysis:
      return parseAiAnalysisEvent(evt, subspaceID, operation as string, authTag, parentHash)
    case OpDiscussion:
      return parseDiscussionEvent(evt, subspaceID, operation as string, authTag, parentHash)
    default:
      return [null, new Error(`unknown operation type: ${operation}`)]
  }
}

function parsePaperEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindOpenresearchPaper, evt.content)
  const paper = new PaperEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let doi = ''
  let paperType = ''
  let authors: string[] = []
  let keywords: string[] = []
  let year = ''
  let journal = ''
  let title = ''
  let abstract = ''
  let url = ''
  let fileHash = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'doi':
        doi = tag[1]
        break
      case 'paper_type':
        paperType = tag[1]
        break
      case 'authors':
        authors = tag.slice(1)
        break
      case 'keywords':
        keywords = tag.slice(1)
        break
      case 'year':
        year = tag[1]
        break
      case 'journal':
        journal = tag[1]
        break
    }
  }

  try {
    const content = JSON.parse(evt.content)
    title = content.title
    abstract = content.abstract
    url = content.url
    fileHash = content.file_hash
  } catch (err) {
    return [baseEvent, new Error(`failed to parse paper content: ${err}`)]
  }

  paper.setPaperInfo(doi, paperType, authors, keywords, year, journal, title, abstract, url, fileHash)
  return [paper.SubspaceOpEvent, null]
}

function parseAnnotationEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindOpenresearchAnnotation, evt.content)
  const annotation = new AnnotationEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let paperID = ''
  let position = ''
  let type = ''
  let parentID = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'paper_id':
        paperID = tag[1]
        break
      case 'position':
        position = tag[1]
        break
      case 'type':
        type = tag[1]
        break
      case 'parent':
        parentID = tag[1]
        break
    }
  }

  annotation.setAnnotationInfo(paperID, position, type, parentID, evt.content)
  return [annotation.SubspaceOpEvent, null]
}

function parseReviewEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindOpenresearchReview, evt.content)
  const review = new ReviewEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let paperID = ''
  let rating = 0
  let aspects: Record<string, number> = {}

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'paper_id':
        paperID = tag[1]
        break
      case 'rating':
        rating = parseFloat(tag[1])
        break
      case 'aspects':
        aspects = Object.fromEntries(
          tag[1].split(',').map(pair => {
            const [key, value] = pair.split(':')
            return [key, parseFloat(value)]
          }),
        )
        break
    }
  }

  let summary = ''
  let strengths = ''
  let weaknesses = ''
  let recommendations = ''

  try {
    const content = JSON.parse(evt.content)
    summary = content.summary
    strengths = content.strengths
    weaknesses = content.weaknesses
    recommendations = content.recommendations
  } catch (err) {
    return [baseEvent, new Error(`failed to parse review content: ${err}`)]
  }

  review.setReviewInfo(paperID, rating, aspects, summary, strengths, weaknesses, recommendations)
  return [review.SubspaceOpEvent, null]
}

function parseAiAnalysisEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindOpenresearchAiAnalysis, evt.content)
  const aiAnalysis = new AiAnalysisEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let analysisType = ''
  let paperIDs: string[] = []
  let prompt = ''

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'analysis_type':
        analysisType = tag[1]
        break
      case 'paper_ids':
        paperIDs = tag.slice(1)
        break
      case 'prompt':
        prompt = tag[1]
        break
    }
  }

  let analysisResult = ''
  let keyInsights: string[] = []
  let potentialDirections: string[] = []

  try {
    const content = JSON.parse(evt.content)
    analysisResult = content.analysis_result
    keyInsights = content.key_insights
    potentialDirections = content.potential_directions
  } catch (err) {
    return [baseEvent, new Error(`failed to parse AI analysis content: ${err}`)]
  }

  aiAnalysis.setAiAnalysisInfo(analysisType, paperIDs, prompt, analysisResult, keyInsights, potentialDirections)
  return [aiAnalysis.SubspaceOpEvent, null]
}

function parseDiscussionEvent(
  evt: NostrEvent,
  subspaceID: string,
  operation: string,
  authTag: AuthTag | undefined,
  parents: string[],
): [SubspaceOpEvent, Error | null] {
  const baseEvent = NewSubspaceOpEvent(subspaceID, KindOpenresearchDiscussion, evt.content)
  const discussion = new DiscussionEvent(baseEvent)
  if (authTag) {
    baseEvent.authTag = authTag
  }
  setParents(baseEvent, parents)

  let topic = ''
  let parentID = ''
  let references: string[] = []

  for (const tag of evt.tags) {
    if (tag.length < 2) {
      continue
    }
    switch (tag[0]) {
      case 'topic':
        topic = tag[1]
        break
      case 'parent':
        parentID = tag[1]
        break
      case 'references':
        references = tag.slice(1)
        break
    }
  }

  discussion.setDiscussionInfo(topic, parentID, references, evt.content)
  return [discussion.SubspaceOpEvent, null]
}

// NewPaperEvent creates a new paper event
export async function newPaperEvent(subspaceID: string, content: string): Promise<PaperEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindOpenresearchPaper, content)
  return new PaperEvent(baseEvent)
}

// NewAnnotationEvent creates a new annotation event
export async function newAnnotationEvent(subspaceID: string, content: string): Promise<AnnotationEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindOpenresearchAnnotation, content)
  return new AnnotationEvent(baseEvent)
}

// NewReviewEvent creates a new review event
export async function newReviewEvent(subspaceID: string, content: string): Promise<ReviewEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindOpenresearchReview, content)
  return new ReviewEvent(baseEvent)
}

// NewAiAnalysisEvent creates a new AI analysis event
export async function newAiAnalysisEvent(subspaceID: string, content: string): Promise<AiAnalysisEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindOpenresearchAiAnalysis, content)
  return new AiAnalysisEvent(baseEvent)
}

// NewDiscussionEvent creates a new discussion event
export async function newDiscussionEvent(subspaceID: string, content: string): Promise<DiscussionEvent | null> {
  const baseEvent = await NewSubspaceOpEvent(subspaceID, KindOpenresearchDiscussion, content)
  return new DiscussionEvent(baseEvent)
}

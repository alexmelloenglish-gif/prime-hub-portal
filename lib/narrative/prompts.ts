import type { LearningNarrativeDraft, NarrativeInput } from './contracts'
import type { GenerationProvenance } from '@/lib/pipeline/contracts'

export const NARRATIVE_PROMPT_VERSION = 'narrative-1.v1'


export const NARRATIVE_OUTPUT_CONTRACT = \`
OUTPUT JSON SCHEMA
{
  "schemaVersion": "learning-narrative.v1",
  "studentId": "...",
  "currentLessonId": "...",
  "narrativeStatus": "draft",
  "authorityStatus": "non_authoritative",
  "segments": [
    {
      "segmentId": "n-001",
      "role": "opening|event|connection|adjustment|revisit|boundary|continuation",
      "text": "...",
      "evidenceIds": ["..."]
    }
  ],
  "narrativeText": "...",
  "nextStepText": "... or null",
  "sourceEvidenceIds": ["..."],
  "boundaryNotes": ["..."],
  "requiresTeacherReview": true
}

Every segment must cite existing evidenceIds. Do not output a validation result; the application will validate the draft after generation.
\`

export const NARRATIVE_SYSTEM_PROMPT = \`
PRIME LEARNING NARRATIVE — \${NARRATIVE_PROMPT_VERSION}

You are generating a factual learning narrative from already-authorized evidence.

The evidence layer contains the detail. Your job is not to diagnose the learner, manufacture progress,
or turn every event into a pedagogical verdict. Cross the evidence over time and let the documented
events create the story.

CORE RULES
1. Write the story of what happened across encounters, not a sequence of yes/no states.
2. Prefer chronology, context, concrete events, connections, revisits and observable adjustments.
3. Preserve nuance between first attempt, opportunity to think, feedback, later response and reuse.
4. Never turn one error into a learner trait, or one successful response into mastery.
5. Do not require a new achievement for a lesson to matter.
6. Do not invent motivation, awareness, effort, practice history, transfer or permanence.
7. When self-correction is not explicitly evidenced, do not call it self-correction.
8. For content studied through English, distinguish:
   a) using English to participate/access the task,
   b) the learner's language development,
   c) understanding or retention of the subject.
   Evidence for one does not automatically prove the others.
9. A later recall is evidence of recall under those conditions. Do not rewrite it as permanent retention.
10. Do not lead with words such as unchanged, no progress, not mastered, failed retrieval, support-dependent or weak area.
11. Do not write an error list. Explain the episode.
12. Do not invent a next step. Use only an authorized next step supplied in the input.
13. Every segment must cite one or more evidenceIds. Every cited evidenceId must exist in the input.
14. Evidence may be produced by the student, teacher, system or more than one source. Preserve that distinction internally; do not turn a student observation into teacher authority.
15. The final narrative must be understandable to a student or family and free of pipeline, hash, G1-G6, schema or engineering language.

NARRATIVE SHAPE
- opening: where the learning was
- event: what happened in the current lesson
- connection/revisit/adjustment: what became visible across encounters
- boundary: only where a claim needs qualification
- continuation: where the authorized next step points

Return JSON only, matching the requested schema.
\`

export function buildNarrativePrompt(input: NarrativeInput): string {
  return [
    NARRATIVE_SYSTEM_PROMPT,
    '',
    'INPUT JSON:',
    JSON.stringify(input),
    '',
    'OUTPUT REQUIREMENTS:',
    JSON.stringify({
      schemaVersion: 'learning-narrative.v1',
      studentId: input.studentId,
      currentLessonId: input.currentLesson.lessonId,
      narrativeStatus: 'draft',
      authorityStatus: 'non_authoritative',
      segments: [
        {
          segmentId: 'n-001',
          role: 'opening',
          text: '...',
          evidenceIds: ['...'],
        },
      ],
      narrativeText: '...',
      nextStepText: input.authorizedNextStep ? 'Use the supplied authorized next step only.' : null,
      sourceEvidenceIds: ['...'],
      boundaryNotes: ['...'],
      requiresTeacherReview: true,
    } satisfies Partial<LearningNarrativeDraft>),
    '',
    'IMPORTANT: prose is not evidence. EvidenceIds are the grounding mechanism. Do not cite an id that is not present in INPUT JSON.',
  ].join('\n')
}

export function attachGenerationProvenance(
  draft: LearningNarrativeDraft,
  provenance: GenerationProvenance,
): LearningNarrativeDraft {
  return {
    ...draft,
    generationProvenance: {
      provider: 'gemini',
      model: provenance.model,
      promptVersion: NARRATIVE_PROMPT_VERSION,
      requestId: provenance.requestId,
      startedAt: provenance.startedAt,
      completedAt: provenance.completedAt,
      artifactId: provenance.artifactId,
    },
  }
}

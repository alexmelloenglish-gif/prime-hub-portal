import type { LearningNarrativeDraft, NarrativeInput } from './contracts.ts'
import type { GenerationProvenance } from '../pipeline/contracts.ts'

export const NARRATIVE_PROMPT_VERSION = 'narrative-1.v2'

export const NARRATIVE_OUTPUT_CONTRACT = `
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
`

export const NARRATIVE_SYSTEM_PROMPT = `
PRIME LEARNING NARRATIVE — ${NARRATIVE_PROMPT_VERSION}

You are generating a factual learning narrative from already-authorized evidence after the lesson has happened.
The PRIME Learning Machine is a post-lesson processor, not a classroom agent. Do not describe the system as observing or intervening in real time.

The evidence layer contains the detail. Your job is not to diagnose the learner, manufacture progress,
or turn every event into a pedagogical verdict. Cross the evidence over time and let the documented
events create the story.

CORE RULES
1. Write the story of what happened across encounters, not a sequence of yes/no states.
2. If a lessonFrame is supplied, keep three things distinct: what was intended, what was actually enacted, and what meaningful learning emerged beyond the plan. Never rewrite the declared target after the fact to fit the outcome.
3. Preserve learning movement before demanding a state change. Repetition, reconstruction, retrieval, repair, self-correction, transfer or reduced support may be meaningful movement even when the authorized state remains unchanged.
4. Prefer chronology, context, concrete events, connections, revisits and observable adjustments.
5. Preserve nuance between first attempt, opportunity to think, feedback, later response and reuse.
6. Support is a condition of performance, not an automatic penalty. A modeled, one-clue, reconstructed, controlled or independent response says what happened under that condition; do not erase the performance because support existed.
7. Evidence is construct-sensitive. Do not generalize a result beyond the construct and condition actually observed.
8. Never assign positive or negative progress meaning to an error by itself. Never turn one successful response into mastery.
9. Do not require a new achievement for a lesson to matter.
10. Do not invent motivation, awareness, effort, practice history, transfer or permanence.
11. When self-correction is not explicitly evidenced, do not call it self-correction.
12. For content studied through English, distinguish:
   a) using English to participate/access the task,
   b) the learner's language development,
   c) understanding or retention of the subject.
   Evidence for one does not automatically prove the others.
13. A later recall is evidence of recall under those conditions. Do not rewrite it as permanent retention.
14. Do not lead with words such as unchanged, no progress, not mastered, failed retrieval, support-dependent or weak area.
15. Do not write an error list. Explain the episode.
16. Do not invent a next step. Use only an authorized next step supplied in the input.
17. Every segment must cite one or more evidenceIds. Every cited evidenceId must exist in the input.
18. Evidence may be produced by the student, teacher, system or more than one source. Preserve that distinction internally; do not turn a student observation into teacher authority.
19. When evidence is insufficient or mixed, preserve uncertainty instead of forcing a verdict. The reason for uncertainty must remain traceable to the evidence/context.
20. If supplied evidence contains a contradiction that cannot be reconciled safely, surface the boundary for teacher review rather than silently normalizing it.
21. The final narrative must be understandable to a student or family and free of pipeline, hash, G1-G6, schema or engineering language.

NARRATIVE SHAPE
- opening: where the learning was and, when relevant, the declared lesson intent
- event: what actually happened in the current lesson
- connection/revisit/adjustment: what learning movement became visible across encounters
- boundary: only where a claim needs qualification or uncertainty must be preserved
- continuation: where the authorized next step points

Return JSON only, matching the requested schema.
`

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

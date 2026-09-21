import assert from 'node:assert/strict'
import { buildLessonDigestCandidate } from '../lib/narrative/lesson-digest.ts'

const frame = {
  mode: 'targeted',
  primaryTarget: 'Personal past narration',
  expectedLearnerOutcome: 'Tell three recent events with progressively less support.',
  showcaseOpportunities: [
    {
      opportunityId: 'showcase-01',
      description: 'Open weekend recount before target-verb modeling.',
      constructObserved: 'personal past narration',
      intendedCondition: 'open_communication',
      boundary: 'Does not establish global Past Simple mastery.',
    },
  ],
  secondaryRecycling: ['Present/past short answers'],
  contextReason: 'Continue the current past-time trajectory.',
}

const evidence = [
  {
    evidenceId: 'ev-1',
    lessonId: 'lesson-1',
    occurredAt: '2026-09-21',
    type: 'language_use',
    statement: 'Learner produced one past event independently.',
    sourceRefs: ['src-1'],
    authorization: 'teacher_validated',
    producer: 'student',
    domain: 'language',
    condition: 'independent',
  },
  {
    evidenceId: 'ev-2',
    lessonId: 'lesson-1',
    occurredAt: '2026-09-21',
    type: 'language_adjustment',
    statement: 'Learner reconstructed a second past form after one clue.',
    sourceRefs: ['src-2'],
    authorization: 'teacher_validated',
    producer: 'student',
    domain: 'language',
    condition: 'one_clue',
  },
  {
    evidenceId: 'ev-3',
    lessonId: 'lesson-1',
    occurredAt: '2026-09-21',
    type: 'teacher_context',
    statement: 'Teacher preserved the first attempt before offering one clue.',
    sourceRefs: ['src-3'],
    authorization: 'teacher_validated',
    producer: 'teacher',
    domain: 'language',
    condition: 'open_communication',
  },
]

const digest = buildLessonDigestCandidate({
  lessonId: 'lesson-1',
  lessonFrame: frame,
  evidence,
  opportunityExecutions: [
    { opportunityId: 'showcase-01', created: true, evidenceIds: ['ev-1', 'ev-2'] },
  ],
  learnerResponses: [
    { text: 'One independent past event and one one-clue reconstruction were observed.', evidenceIds: ['ev-1', 'ev-2'] },
  ],
  learningMovement: [
    { text: 'The learner moved from independent retrieval to successful reconstruction under a single clue.', evidenceIds: ['ev-1', 'ev-2'] },
  ],
  teacherMoves: [
    { text: 'The teacher preserved the first attempt before giving a single clue.', evidenceIds: ['ev-3'] },
  ],
  proposedTargetAttainment: 'substantially_addressed',
  nextTeachingImplications: ['Retain an open recount before controlled verb practice.'],
})

assert.equal(digest.authorityStatus, 'candidate_non_authoritative')
assert.equal(digest.observability.targetObservability, 'adequate')
assert.equal(digest.targetAttainment, 'substantially_addressed')
assert.equal(digest.requiresTeacherReview, true)

const missingOpportunity = buildLessonDigestCandidate({
  lessonId: 'lesson-2',
  lessonFrame: frame,
  evidence,
  opportunityExecutions: [
    { opportunityId: 'showcase-01', created: false, evidenceIds: [] },
  ],
  learnerResponses: [],
  learningMovement: [],
  teacherMoves: [],
  proposedTargetAttainment: 'clearly_demonstrated',
})

assert.equal(missingOpportunity.observability.targetObservability, 'not_observable')
assert.equal(missingOpportunity.targetAttainment, 'not_observable')
assert.ok(
  missingOpportunity.warnings.some((warning) =>
    warning.includes('Do not infer learner inability'),
  ),
)

const unknownEvidence = buildLessonDigestCandidate({
  lessonId: 'lesson-3',
  lessonFrame: frame,
  evidence,
  opportunityExecutions: [
    { opportunityId: 'showcase-01', created: true, evidenceIds: ['ev-1'] },
  ],
  learnerResponses: [
    { text: 'Unsupported statement.', evidenceIds: ['missing'] },
  ],
  learningMovement: [],
  teacherMoves: [],
  proposedTargetAttainment: 'partially_addressed',
})

assert.ok(
  unknownEvidence.warnings.some((warning) => warning.includes('unknown evidence missing')),
)

console.log(
  'Lesson Digest self-test passed: intent, opportunity, learner response, teacher moves and attainment remain evidence-linked and non-authoritative.',
)

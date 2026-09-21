import assert from 'node:assert/strict'
import {
  canAuthorizeCefrTransition,
  validateCefrTransitionAuthority,
} from '../lib/narrative/cefr-authority.ts'
import {
  reconcileObservationDebt,
  reconcileObservationDebtsForLesson,
} from '../lib/narrative/observation-debt.ts'
import {
  buildSelfCorrectionStageAssessment,
  summarizeSelfCorrectionTrajectory,
} from '../lib/narrative/self-correction.ts'
import { proposeLearningStage } from '../lib/narrative/pedagogical-semantics.ts'

// CEFR: ordinary lesson evidence can never authorize a level transition.
assert.equal(
  canAuthorizeCefrTransition({
    source: 'lesson_accumulation',
    assessmentReference: 'five-lessons',
    pedagogicallyAuthorized: true,
    explicitProfileUpdate: true,
  }),
  false,
)
assert.ok(
  validateCefrTransitionAuthority({
    source: 'lesson_replay',
    pedagogicallyAuthorized: false,
    explicitProfileUpdate: false,
  }).some((error) => error.includes('formal assessment')),
)

assert.equal(
  canAuthorizeCefrTransition({
    source: 'formal_assessment',
    assessmentProcess: 'authorized-placement-assessment-v1',
    pedagogicallyAuthorized: true,
    explicitProfileUpdate: true,
  }),
  true,
)

// Self-correction: different learner-initiated repair forms can contribute longitudinally.
const selfCorrectionEvents = [
  {
    evidenceId: 'E-L1-RESPONSE',
    lessonId: 'L1',
    type: 'response_correction',
    learnerInitiated: true,
    pedagogicallyRelevant: true,
    condition: 'open communication',
  },
  {
    evidenceId: 'E-L2-LEXICAL',
    lessonId: 'L2',
    type: 'lexical_correction',
    learnerInitiated: true,
    pedagogicallyRelevant: true,
    condition: 'open communication',
  },
  {
    evidenceId: 'E-L2-TEACHER',
    lessonId: 'L2',
    type: 'tense_form_correction',
    learnerInitiated: false,
    pedagogicallyRelevant: true,
    condition: 'teacher modeled',
  },
]

const summary = summarizeSelfCorrectionTrajectory(selfCorrectionEvents)
assert.equal(summary.credibleManifestations, 2)
assert.equal(summary.lessonCount, 2)
assert.deepEqual(
  new Set(summary.manifestationTypes),
  new Set(['response_correction', 'lexical_correction']),
)
assert.deepEqual(summary.excludedEvidenceIds, ['E-L2-TEACHER'])

assert.equal(
  proposeLearningStage(buildSelfCorrectionStageAssessment(selfCorrectionEvents)).stage,
  'emerging',
  'Two credible learner-initiated repairs across lessons may support an emerging candidate; they need not occur in one lesson or share one surface form.',
)

// Observation Debt: L4 Science question is tested in L5 and the old debt closes.
const scienceDebt = {
  debtId: 'OD-SCI-01',
  originLessonId: 'L4',
  claimToCheck: 'What Science content returns after a delay before reteaching?',
  domain: 'science_through_english',
  requiredOpportunity: 'Delayed no-model Science recall',
  supportAllowed: 'record independent / clue / model',
  evidenceNeeded: 'first attempt plus support path',
  status: 'OPEN',
}

const scienceSuccessor = {
  debtId: 'OD-SCI-02',
  parentDebtId: 'OD-SCI-01',
  originLessonId: 'L5',
  claimToCheck: 'Can the same Science content be reconstructed again with fewer cues?',
  domain: 'science_through_english',
  requiredOpportunity: 'Reduced-support delayed recall',
  supportAllowed: 'fewer cues than L5',
  evidenceNeeded: 'first attempt plus cue count',
  status: 'OPEN',
}

const scienceReconciliation = reconcileObservationDebt({
  debt: scienceDebt,
  currentLessonId: 'L5',
  opportunityAssessment: 'OCCURRED',
  evidenceRefs: ['E-SCI-L5-01', 'E-SCI-L5-02'],
  resolution: 'TESTED_PARTIAL',
  resultBoundary: 'Partial reconstruction after delay; support still required.',
  successorDebt: scienceSuccessor,
})

assert.equal(scienceReconciliation.statusAfterLesson, 'CLOSED')
assert.equal(scienceReconciliation.successorDebtId, 'OD-SCI-02')

const pastDebt = {
  debtId: 'OD-PAST-01',
  originLessonId: 'L3',
  claimToCheck: 'Can familiar past language be retrieved in a comparable context?',
  domain: 'past_time',
  requiredOpportunity: 'Comparable past-time elicitation',
  status: 'OPEN',
}

const reconciled = reconcileObservationDebtsForLesson({
  debtsAtLessonStart: [pastDebt],
  reconciliationInputs: [
    {
      debt: pastDebt,
      currentLessonId: 'L4',
      opportunityAssessment: 'NOT_OCCURRED',
      resolution: 'NOT_TESTED',
      resultBoundary: 'The lesson focused on Science and did not create a comparable Past opportunity.',
    },
  ],
})

assert.equal(reconciled[0].statusAfterLesson, 'OPEN')
assert.equal(reconciled[0].resolution, 'NOT_TESTED')

assert.throws(
  () =>
    reconcileObservationDebt({
      debt: scienceDebt,
      currentLessonId: 'L5',
      opportunityAssessment: 'OCCURRED',
      resolution: 'NOT_TESTED',
      resultBoundary: 'Invalid stale carry-forward.',
    }),
  /cannot resolve as NOT_TESTED/,
)

assert.throws(
  () =>
    reconcileObservationDebtsForLesson({
      debtsAtLessonStart: [scienceDebt],
      reconciliationInputs: [],
    }),
  /exactly one reconciliation record/,
)

console.log(
  'Pedagogical guardrails self-test passed: CEFR requires formal assessment authority, self-correction accumulates across repair forms/lessons, and ObservationDebt cannot silently remain stale after a real opportunity.',
)

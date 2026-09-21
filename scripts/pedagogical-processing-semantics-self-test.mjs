import assert from 'node:assert/strict'
import {
  proposeLearningStage,
  validateLearningStageAssessment,
} from '../lib/narrative/pedagogical-semantics.ts'

const base = {
  construct: 'synthetic target',
  condition: 'open communication',
}

assert.equal(
  proposeLearningStage({
    ...base,
    credibleManifestations: 1,
    meaningfulManifestations: 1,
    relativeReliability: false,
  }).stage,
  'observed_signal',
)

assert.equal(
  proposeLearningStage({
    ...base,
    credibleManifestations: 2,
    meaningfulManifestations: 2,
    relativeReliability: false,
  }).stage,
  'emerging',
)

assert.equal(
  proposeLearningStage({
    ...base,
    credibleManifestations: 4,
    meaningfulManifestations: 4,
    relativeReliability: false,
  }).stage,
  'developing',
)

assert.equal(
  proposeLearningStage({
    ...base,
    credibleManifestations: 5,
    meaningfulManifestations: 5,
    relativeReliability: false,
  }).stage,
  'developing',
  'Five manifestations without relative reliability must not be promoted to consistent.',
)

const consistent = proposeLearningStage({
  construct: 'target pronunciation',
  condition: 'after immediate teacher modeling',
  credibleManifestations: 5,
  meaningfulManifestations: 5,
  relativeReliability: true,
})
assert.equal(consistent.stage, 'consistent')
assert.equal(consistent.authorityStatus, 'candidate_non_authoritative')
assert.equal(consistent.condition, 'after immediate teacher modeling')

assert.equal(
  proposeLearningStage({
    ...base,
    credibleManifestations: 5,
    meaningfulManifestations: 5,
    relativeReliability: true,
    previouslyConsistent: true,
    persistsOverTime: true,
  }).stage,
  'stable_established',
)

assert.equal(
  proposeLearningStage({
    ...base,
    credibleManifestations: 6,
    meaningfulManifestations: 6,
    relativeReliability: true,
    previouslyConsistent: true,
    persistsAcrossContexts: true,
    autonomous: true,
    flexible: true,
    transferable: true,
    durable: true,
  }).stage,
  'mastery',
)

assert.deepEqual(
  validateLearningStageAssessment({
    ...base,
    credibleManifestations: 2,
    meaningfulManifestations: 3,
    relativeReliability: false,
  }),
  ['meaningfulManifestations cannot exceed credibleManifestations.'],
)

assert.ok(
  validateLearningStageAssessment({
    ...base,
    credibleManifestations: 2,
    meaningfulManifestations: 2,
    relativeReliability: false,
    persistsOverTime: true,
  }).some((error) => error.includes('cannot bypass prior consistency')),
)

assert.ok(
  validateLearningStageAssessment({
    ...base,
    construct: '',
    credibleManifestations: 1,
    meaningfulManifestations: 1,
    relativeReliability: false,
  }).includes('construct is required.'),
)

console.log(
  'Pedagogical Processing Freeze v1.0 self-test passed: stage semantics are condition-scoped, non-authoritative, and perfection is not a state.',
)

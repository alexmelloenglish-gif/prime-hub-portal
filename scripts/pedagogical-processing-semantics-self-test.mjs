import assert from 'node:assert/strict'
import {
  classifyLearningStage,
  validateLearningStageAssessment,
} from '../lib/narrative/pedagogical-semantics.ts'

assert.equal(
  classifyLearningStage({
    credibleManifestations: 1,
    meaningfulManifestations: 1,
    relativeReliability: false,
  }),
  'observed_signal',
)

assert.equal(
  classifyLearningStage({
    credibleManifestations: 2,
    meaningfulManifestations: 2,
    relativeReliability: false,
  }),
  'emerging',
)

assert.equal(
  classifyLearningStage({
    credibleManifestations: 4,
    meaningfulManifestations: 4,
    relativeReliability: false,
  }),
  'developing',
)

assert.equal(
  classifyLearningStage({
    credibleManifestations: 5,
    meaningfulManifestations: 5,
    relativeReliability: false,
  }),
  'developing',
  'Five manifestations without relative reliability must not be promoted to consistent.',
)

assert.equal(
  classifyLearningStage({
    credibleManifestations: 5,
    meaningfulManifestations: 5,
    relativeReliability: true,
  }),
  'consistent',
)

assert.equal(
  classifyLearningStage({
    credibleManifestations: 5,
    meaningfulManifestations: 5,
    relativeReliability: true,
    previouslyConsistent: true,
    persistsOverTime: true,
  }),
  'stable_established',
)

assert.equal(
  classifyLearningStage({
    credibleManifestations: 6,
    meaningfulManifestations: 6,
    relativeReliability: true,
    previouslyConsistent: true,
    persistsAcrossContexts: true,
    autonomous: true,
    flexible: true,
    transferable: true,
    durable: true,
  }),
  'mastery',
)

assert.deepEqual(
  validateLearningStageAssessment({
    credibleManifestations: 2,
    meaningfulManifestations: 3,
    relativeReliability: false,
  }),
  ['meaningfulManifestations cannot exceed credibleManifestations.'],
)

assert.ok(
  validateLearningStageAssessment({
    credibleManifestations: 2,
    meaningfulManifestations: 2,
    relativeReliability: false,
    persistsOverTime: true,
  }).some((error) => error.includes('cannot bypass prior consistency')),
)

console.log(
  'Pedagogical Processing Freeze v1.0 self-test passed: observed/emerging/developing/consistent/stable/mastery thresholds are distinct and perfection is not a state.',
)

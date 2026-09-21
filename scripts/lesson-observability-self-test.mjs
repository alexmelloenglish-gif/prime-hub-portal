import assert from 'node:assert/strict'
import { assessLessonObservability } from '../lib/narrative/lesson-observability.ts'

const planned = [
  {
    opportunityId: 'showcase-01',
    description: 'Tell three things that happened during the weekend before target-verb modeling.',
    constructObserved: 'personal past narration',
    intendedCondition: 'open_communication',
    boundary: 'Does not establish global Past Simple mastery.',
  },
]

const missingOpportunity = assessLessonObservability({
  mode: 'targeted',
  primaryTarget: 'Personal past narration',
  plannedOpportunities: planned,
  executions: [{ opportunityId: 'showcase-01', created: false, evidenceIds: [] }],
})

assert.equal(missingOpportunity.targetObservability, 'not_observable')
assert.ok(
  missingOpportunity.warnings.some((warning) =>
    warning.includes('Do not infer learner inability'),
  ),
)

const createdWithoutEvidence = assessLessonObservability({
  mode: 'targeted',
  primaryTarget: 'Personal past narration',
  plannedOpportunities: planned,
  executions: [{ opportunityId: 'showcase-01', created: true, evidenceIds: [] }],
})

assert.equal(createdWithoutEvidence.targetObservability, 'limited')

const adequate = assessLessonObservability({
  mode: 'targeted',
  primaryTarget: 'Personal past narration',
  plannedOpportunities: planned,
  executions: [{ opportunityId: 'showcase-01', created: true, evidenceIds: ['ev-01', 'ev-02'] }],
})

assert.equal(adequate.targetObservability, 'adequate')
assert.equal(adequate.createdOpportunityCount, 1)
assert.equal(adequate.evidenceLinkedOpportunityCount, 1)

const discovery = assessLessonObservability({
  mode: 'exploratory',
  primaryTarget: 'Explore current spoken-English profile',
  plannedOpportunities: [],
  executions: [],
})

assert.equal(discovery.targetObservability, 'limited')
assert.ok(
  discovery.warnings.some((warning) =>
    warning.includes('discovery-based'),
  ),
)

console.log(
  'Lesson observability self-test passed: missing opportunities cannot be misread as learner inability, and evidence-linked opportunities are distinguished from discovery-only processing.',
)

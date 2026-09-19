import assert from 'node:assert/strict'
import { validateNarrativeDraft, prepareNarrativeInput } from '../lib/narrative/engine.ts'

const input = prepareNarrativeInput({
  studentId: 'synthetic-learner-001',
  studentName: 'Synthetic Learner',
  currentLesson: {
    lessonId: 'lesson-05',
    occurredAt: '2026-09-15',
    purpose: 'Personal communication and review',
    description: 'The learner talked about the weekend, used present/past short answers, and returned to earlier content.',
    evidenceIds: ['ev-01', 'ev-02', 'ev-05'],
  },
  priorLessons: [
    {
      lessonId: 'lesson-01',
      occurredAt: '2026-08-18',
      purpose: 'Personal communication',
      description: 'The learner talked about personal experiences and began using past forms in meaningful conversation.',
      evidenceIds: ['ev-01'],
    },
    {
      lessonId: 'lesson-03',
      occurredAt: '2026-09-08',
      purpose: 'Science review through English',
      description: 'The learner worked with nutrients and the digestive system in English.',
      evidenceIds: ['ev-03'],
    },
  ],
  evidence: [
    {
      evidenceId: 'ev-01',
      lessonId: 'lesson-01',
      occurredAt: '2026-08-18',
      type: 'language_use',
      statement: 'The learner used past forms while talking about a personal experience, with teacher support documented in the lesson.',
      sourceRefs: ['src-01'],
      authorization: 'teacher_validated',
      producer: 'teacher',
      domain: 'language',
      support: 'teacher support documented',
    },
    {
      evidenceId: 'ev-02',
      lessonId: 'lesson-05',
      occurredAt: '2026-09-15',
      type: 'language_adjustment',
      statement: 'In a past-tense short-answer exchange, the learner first used the present negative and then changed the response to the past form after noticing the mismatch.',
      sourceRefs: ['src-05'],
      authorization: 'teacher_validated',
      producer: 'student',
      domain: 'language',
      support: 'opportunity to reconsider documented',
      relatedLessonIds: ['lesson-01'],
    },
    {
      evidenceId: 'ev-03',
      lessonId: 'lesson-03',
      occurredAt: '2026-09-08',
      type: 'content_participation',
      statement: 'The learner participated in a Science review in English using words, images and explanations about nutrients and digestion.',
      sourceRefs: ['src-03'],
      authorization: 'teacher_validated',
      producer: 'teacher',
      domain: 'content',
    },
    {
      evidenceId: 'ev-05',
      lessonId: 'lesson-05',
      occurredAt: '2026-09-15',
      type: 'revisit',
      statement: 'When earlier Science content returned, some food examples were recalled and other ideas were reconstructed with prompts.',
      sourceRefs: ['src-05'],
      authorization: 'teacher_validated',
      domain: 'content',
      relatedLessonIds: ['lesson-03'],
    },
  ],
  authorizedNextStep: {
    title: 'Mixed Present/Past Independence Challenge',
    description: 'Use present and past short answers in mixed questions and personal stories.',
    sourceRefs: ['teacher-decision-05'],
  },
})

const draft = {
  schemaVersion: 'learning-narrative.v1',
  studentId: input.studentId,
  currentLessonId: input.currentLesson.lessonId,
  narrativeStatus: 'draft',
  authorityStatus: 'non_authoritative',
  segments: [
    { segmentId: 'n-01', role: 'opening', text: 'The learner continued using English to talk about personal experiences.', evidenceIds: ['ev-01', 'ev-02'] },
    { segmentId: 'n-02', role: 'adjustment', text: 'In the latest lesson, a past-tense answer did not come immediately, and the learner changed the response after noticing the mismatch.', evidenceIds: ['ev-02'] },
    { segmentId: 'n-03', role: 'revisit', text: 'Science content also returned in English: some earlier details came back and other ideas were rebuilt with prompts.', evidenceIds: ['ev-03', 'ev-05'] },
    { segmentId: 'n-04', role: 'boundary', text: 'This episode documents participation in Science through English and a later return to some of the content; it does not by itself establish lasting subject retention.', evidenceIds: ['ev-03', 'ev-05'] },
    { segmentId: 'n-05', role: 'continuation', text: 'The next step is to continue mixing present and past short answers in questions and personal stories.', evidenceIds: ['ev-02'] },
  ],
  narrativeText: 'The learner continued using English to talk about personal experiences. In the latest lesson, a past-tense answer did not come immediately, and the learner changed the response after noticing the mismatch. Science content also returned in English: some earlier details came back and other ideas were rebuilt with prompts. This episode documents participation in Science through English and a later return to some of the content; it does not by itself establish lasting subject retention. The next step is to continue mixing present and past short answers in questions and personal stories.',
  nextStepText: 'The next step is to continue mixing present and past short answers in questions and personal stories.',
  sourceEvidenceIds: ['ev-01', 'ev-02', 'ev-03', 'ev-05'],
  boundaryNotes: ['Science participation through English and later recall are documented separately from subject mastery.'],
  requiresTeacherReview: true,
}

const validation = validateNarrativeDraft(draft, input)
assert.equal(validation.passed, true)
assert.deepEqual(new Set(validation.referencedEvidenceIds), new Set(['ev-01', 'ev-02', 'ev-03', 'ev-05']))
assert.equal(validation.errors.length, 0)

const invalid = structuredClone(draft)
invalid.segments[1].evidenceIds = ['unknown']
const failed = validateNarrativeDraft(invalid, input)
assert.equal(failed.passed, false)
assert.ok(failed.errors.some((error) => error.includes('unknown evidence')))

console.log('Learning Narrative Machine v1 self-test passed: longitudinal evidence, adjustment, content-participation boundary and authorized continuation are evidence-linked.')

assert.equal(input.evidence.find((item) => item.evidenceId === 'ev-02')?.producer, 'student')

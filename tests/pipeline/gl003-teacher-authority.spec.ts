import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { after, test } from 'node:test'
import { Prisma, PrismaClient } from '@prisma/client'
import { checkpointLearningMachine } from '../../lib/learning-machine/run-history.ts'
import { preparePipelineCanonicalAuthorityValidationTask } from '../../lib/learning-machine/canonical-continuation.ts'

type Fixture = {
  studentId: string
  studentEmail: string
  studentName: string
  teacherId: string
  teacherName: string
  lessonId: string
  transcriptId: string
  sourceFileId: string
  source: string
  transcript: string
  promptOneArtifact: Record<string, unknown>
  teacherDecision: Record<string, unknown>
}

const fixture = JSON.parse(
  await readFile(new URL('../fixtures/gl003/teacher-authority.fixture.json', import.meta.url), 'utf8'),
) as Fixture
const prisma = new PrismaClient()
const pipelineRunId = 'pipeline-run-gl003-fixture'

async function removeFixture() {
  await prisma.pipelineEvent.deleteMany({ where: { pipelineRunId: pipelineRunId } })
  await prisma.validationTask.deleteMany({ where: { entityId: pipelineRunId } })
  await prisma.coachingGuidance.deleteMany({ where: { pipelineRunId: pipelineRunId } })
  await prisma.teacherInsightProposal.deleteMany({ where: { pipelineRunId: pipelineRunId } })
  await prisma.learningSignalProposal.deleteMany({ where: { pipelineRunId: pipelineRunId } })
  await prisma.evidenceCandidate.deleteMany({ where: { pipelineRunId: pipelineRunId } })
  await prisma.pipelineRun.deleteMany({ where: { id: pipelineRunId } })
  await prisma.transcript.deleteMany({ where: { id: fixture.transcriptId } })
}

after(async () => {
  await removeFixture()
  await prisma.$disconnect()
})

test('GL-003: authority task preserves provenance, traceability, and explicit teacher boundary', async () => {
  await removeFixture()

  await prisma.transcript.create({
    data: {
      id: fixture.transcriptId,
      externalId: 'external-gl003-fixture',
      sourceFileId: fixture.sourceFileId,
      studentEmail: fixture.studentEmail,
      lessonId: fixture.lessonId,
      source: fixture.source,
      content: fixture.transcript,
      metadata: {
        _pipelineInput: {
          studentId: fixture.studentId,
          studentName: fixture.studentName,
          teacherId: fixture.teacherId,
          teacherName: fixture.teacherName,
          source: fixture.source,
          transcriptId: fixture.transcriptId,
          sourceFileId: fixture.sourceFileId,
        },
      },
    },
  })

  await prisma.pipelineRun.create({
    data: {
      id: pipelineRunId,
      idempotencyKey: 'gl003-fixture-idempotency',
      transcriptId: fixture.transcriptId,
      studentEmail: fixture.studentEmail,
      lessonId: fixture.lessonId,
      status: 'processing',
      executionMode: 'shared_learning_machine',
      normalizedRunIdentity: 'gl003-fixture-normalized-identity',
      promptOneSchemaVersion: 'phase-b-prompt-1.v3',
      promptOneArtifact: fixture.promptOneArtifact as Prisma.InputJsonValue,
    },
  })

  await prisma.evidenceCandidate.create({
    data: {
      pipelineRunId,
      transcriptId: fixture.transcriptId,
      candidateKey: 'candidate-gl003-fixture',
      sourceSpan: 'Synthetic lesson evidence',
      observation: 'The learner practiced the target grammar.',
      category: 'grammar',
      state: 'proposed',
      requiresReview: true,
    },
  })
  await prisma.learningSignalProposal.create({
    data: {
      pipelineRunId,
      proposalKey: 'signal-gl003-fixture',
      signal: 'Target grammar practice is traceable.',
      rationale: 'Synthetic evidence fixture.',
      evidenceIds: ['candidate-gl003-fixture'],
    },
  })
  await prisma.teacherInsightProposal.create({
    data: {
      pipelineRunId,
      text: 'Teacher review is required before canonicalization.',
      evidenceIds: ['candidate-gl003-fixture'],
      signalIds: ['signal-gl003-fixture'],
      authorType: 'ai',
      isOfficial: false,
      requiresReview: true,
      status: 'proposed',
    },
  })
  await prisma.coachingGuidance.create({
    data: {
      pipelineRunId,
      studentEmail: fixture.studentEmail,
      studentId: fixture.studentId,
      teacherId: fixture.teacherId,
      content: {
        recommendedNextClassStrategy: 'Teacher validates the exact preserved payload.',
        proposed_actions: [],
      },
      recommendationStatus: 'ai_proposed',
      isPedagogicalDecision: false,
      requiresHumanReview: true,
      documentStatus: 'draft',
      implementationStatus: 'not_proven',
    },
  })

  const task = await preparePipelineCanonicalAuthorityValidationTask(pipelineRunId)
  const suggestedValue = task.suggestedValue as Record<string, unknown>
  const sourceReferences = suggestedValue.sourceReferences as Array<Record<string, unknown>>
  const pedagogicalPayload = suggestedValue.pedagogicalPayload as Record<string, unknown>
  const evidence = task.evidence as Record<string, unknown>

  assert.equal(task.type, 'canonical_learning_record_authority')
  assert.equal(task.entityType, 'PipelineRun')
  assert.equal(task.entityId, pipelineRunId)
  assert.equal(task.status, 'pending')
  assert.equal(suggestedValue.studentId, fixture.studentId)
  assert.equal(suggestedValue.decisionType, fixture.teacherDecision.decisionType)
  assert.equal(suggestedValue.authorityScope, fixture.teacherDecision.authorityScope)
  assert.equal(sourceReferences[0]?.sourceType, fixture.source)
  assert.equal(sourceReferences[0]?.sourceRef, fixture.sourceFileId)
  assert.deepEqual(evidence.sourceFileId, fixture.sourceFileId)
  assert.equal(evidence.studentId, fixture.studentId)
  assert.equal(evidence.teacherAuthorityBoundary, 'Pending human teacher/admin decision in Teacher Intelligence Validation. No canonicalization or learner-facing publication is authorized yet.')

  const artifact = await prisma.pipelineRun.findUniqueOrThrow({ where: { id: pipelineRunId }, select: { promptOneArtifact: true } })
  const storedArtifact = artifact.promptOneArtifact as Record<string, unknown>
  const provenance = storedArtifact.generationProvenance as Record<string, unknown>
  const traceability = storedArtifact.traceability as Record<string, unknown>
  assert.equal(provenance.provider, 'synthetic-provider')
  assert.equal(provenance.artifactId, 'artifact-gl003-fixture')
  assert.deepEqual(traceability.business_rules_candidates, ['BR-GL003-001'])
  assert.deepEqual((pedagogicalPayload.evidenceBoundaries as string[]).length, 2)

  await checkpointLearningMachine({
    pipelineRunId,
    stage: 'awaiting_teacher_authority',
    status: 'awaiting_teacher_authority',
    resumePoint: 'awaiting_teacher_authority',
    payload: { validationTaskId: task.id, normalizedRunIdentity: 'gl003-fixture-normalized-identity' },
  })

  const persistedRun = await prisma.pipelineRun.findUniqueOrThrow({ where: { id: pipelineRunId } })
  const requestedEvent = await prisma.pipelineEvent.findUniqueOrThrow({
    where: {
      pipelineRunId_eventType_aggregateId: {
        pipelineRunId,
        eventType: 'TeacherAuthorityValidationRequested',
        aggregateId: task.id,
      },
    },
  })
  assert.equal(persistedRun.status, 'awaiting_teacher_authority')
  assert.equal(persistedRun.currentStage, 'awaiting_teacher_authority')
  assert.equal(persistedRun.resumePoint, 'awaiting_teacher_authority')
  assert.deepEqual(requestedEvent.payload, {
    validationTaskId: task.id,
    authorityPayloadHash: evidence.authorityPayloadHash,
    authorityStatus: 'pending_teacher_validation',
  })
})

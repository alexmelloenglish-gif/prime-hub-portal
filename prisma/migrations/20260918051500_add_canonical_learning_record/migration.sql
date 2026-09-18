-- G2 — Atomic Canonicalization + Idempotency
-- Materialize the G1 Canonical Learning Record contract and its canonicalization
-- provenance in the same migration. Runtime creation of record + provenance is
-- performed in one Prisma transaction by the G2 service.

CREATE TABLE "canonical_learning_records" (
    "canonicalRecordId" TEXT NOT NULL,
    "schemaVersion" TEXT NOT NULL DEFAULT 'canonical-learning-record-v1',
    "studentId" TEXT NOT NULL,
    "studentEmail" TEXT,
    "lessonId" TEXT,
    "scopeType" TEXT NOT NULL,
    "scopeKey" TEXT NOT NULL,
    "canonicalVersion" INTEGER NOT NULL,
    "canonicalHash" TEXT NOT NULL,
    "hashAlgorithm" TEXT NOT NULL DEFAULT 'sha256',
    "sourceReferences" JSONB NOT NULL,
    "sourceHash" TEXT,
    "transcriptId" TEXT,
    "pipelineRunId" TEXT,
    "proposalReferences" JSONB,
    "teacherDecisionId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "reviewerRole" TEXT NOT NULL,
    "decisionType" TEXT NOT NULL,
    "authorityScope" TEXT NOT NULL,
    "decisionTimestamp" TIMESTAMP(3) NOT NULL,
    "canonicalizedAt" TIMESTAMP(3) NOT NULL,
    "pedagogicalPayload" JSONB NOT NULL,
    "supersedesRecordId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canonical_learning_records_pkey" PRIMARY KEY ("canonicalRecordId")
);

CREATE TABLE "canonicalization_provenance" (
    "id" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "canonicalRecordId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "scopeType" TEXT NOT NULL,
    "scopeKey" TEXT NOT NULL,
    "teacherDecisionId" TEXT NOT NULL,
    "authoritySourceType" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "decisionTimestamp" TIMESTAMP(3) NOT NULL,
    "canonicalVersion" INTEGER NOT NULL,
    "canonicalHash" TEXT NOT NULL,
    "transactionStatus" TEXT NOT NULL DEFAULT 'committed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canonicalization_provenance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "canonical_learning_records_studentId_scopeKey_canonicalVersion_key"
ON "canonical_learning_records"("studentId", "scopeKey", "canonicalVersion");

CREATE INDEX "canonical_learning_records_studentId_lessonId_idx"
ON "canonical_learning_records"("studentId", "lessonId");

CREATE INDEX "canonical_learning_records_teacherDecisionId_idx"
ON "canonical_learning_records"("teacherDecisionId");

CREATE INDEX "canonical_learning_records_pipelineRunId_idx"
ON "canonical_learning_records"("pipelineRunId");

CREATE INDEX "canonical_learning_records_canonicalHash_idx"
ON "canonical_learning_records"("canonicalHash");

CREATE UNIQUE INDEX "canonicalization_provenance_idempotencyKey_key"
ON "canonicalization_provenance"("idempotencyKey");

CREATE UNIQUE INDEX "canonicalization_provenance_canonicalRecordId_key"
ON "canonicalization_provenance"("canonicalRecordId");

CREATE UNIQUE INDEX "canonicalization_provenance_studentId_teacherDecisionId_scopeType_scopeKey_key"
ON "canonicalization_provenance"("studentId", "teacherDecisionId", "scopeType", "scopeKey");

CREATE INDEX "canonicalization_provenance_studentId_scopeType_scopeKey_idx"
ON "canonicalization_provenance"("studentId", "scopeType", "scopeKey");

CREATE INDEX "canonicalization_provenance_teacherDecisionId_idx"
ON "canonicalization_provenance"("teacherDecisionId");

ALTER TABLE "canonicalization_provenance"
ADD CONSTRAINT "canonicalization_provenance_canonicalRecordId_fkey"
FOREIGN KEY ("canonicalRecordId")
REFERENCES "canonical_learning_records"("canonicalRecordId")
ON DELETE RESTRICT ON UPDATE CASCADE;

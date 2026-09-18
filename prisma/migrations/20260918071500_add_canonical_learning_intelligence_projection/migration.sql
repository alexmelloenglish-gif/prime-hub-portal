-- G5 — Canonical Learning Intelligence Projection
CREATE TABLE "canonical_learning_intelligence_projections" (
    "projectionId" TEXT NOT NULL,
    "projectionKey" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "projectionVersion" TEXT NOT NULL,
    "projectionHash" TEXT NOT NULL,
    "canonicalRecordId" TEXT NOT NULL,
    "canonicalVersion" INTEGER NOT NULL,
    "canonicalHash" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentEmail" TEXT,
    "scopeType" TEXT NOT NULL,
    "scopeKey" TEXT NOT NULL,
    "lessonId" TEXT,
    "teacherDecisionId" TEXT NOT NULL,
    "validationTaskId" TEXT,
    "teacherDecisionPackageId" TEXT,
    "authorityScope" TEXT NOT NULL,
    "sourceReferences" JSONB NOT NULL,
    "g3VerificationId" TEXT NOT NULL,
    "projection" JSONB NOT NULL,
    "projectionStatus" TEXT NOT NULL DEFAULT 'NOT_REQUESTED',
    "mismatchFields" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "canonical_learning_intelligence_projections_pkey" PRIMARY KEY ("projectionId")
);

CREATE UNIQUE INDEX "canonical_learning_intelligence_projections_projectionKey_key"
ON "canonical_learning_intelligence_projections"("projectionKey");

CREATE UNIQUE INDEX "canonical_learning_intelligence_projections_identity_key"
ON "canonical_learning_intelligence_projections"("canonicalRecordId", "targetType", "projectionVersion");

CREATE INDEX "canonical_learning_intelligence_projections_studentId_targetType_idx"
ON "canonical_learning_intelligence_projections"("studentId", "targetType");

CREATE INDEX "canonical_learning_intelligence_projections_projectionStatus_idx"
ON "canonical_learning_intelligence_projections"("projectionStatus");

ALTER TABLE "canonical_learning_intelligence_projections"
ADD CONSTRAINT "canonical_learning_intelligence_projections_canonicalRecordId_fkey"
FOREIGN KEY ("canonicalRecordId") REFERENCES "canonical_learning_records"("canonicalRecordId")
ON DELETE RESTRICT ON UPDATE CASCADE;

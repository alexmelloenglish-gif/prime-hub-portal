-- G4 — First independent projection
-- Additive only. Legacy portfolio, class-report and learner surfaces remain untouched.
CREATE TABLE "canonical_learning_record_projections" (
    "projectionId" TEXT NOT NULL,
    "projectionKey" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "projectionVersion" TEXT NOT NULL,
    "canonicalRecordId" TEXT NOT NULL,
    "canonicalVersion" INTEGER NOT NULL,
    "canonicalHash" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentEmail" TEXT,
    "lessonId" TEXT,
    "sourceReferences" JSONB NOT NULL,
    "projection" JSONB NOT NULL,
    "projectionHash" TEXT NOT NULL,
    "projectionStatus" TEXT NOT NULL DEFAULT 'NOT_REQUESTED',
    "mismatchFields" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "canonical_learning_record_projections_pkey" PRIMARY KEY ("projectionId")
);

CREATE UNIQUE INDEX "canonical_learning_record_projections_projectionKey_key"
  ON "canonical_learning_record_projections"("projectionKey");

CREATE INDEX "canonical_learning_record_projections_canonicalRecordId_idx"
  ON "canonical_learning_record_projections"("canonicalRecordId");

CREATE INDEX "canonical_learning_record_projections_targetType_studentId_idx"
  ON "canonical_learning_record_projections"("targetType", "studentId");

CREATE INDEX "canonical_learning_record_projections_projectionStatus_idx"
  ON "canonical_learning_record_projections"("projectionStatus");

ALTER TABLE "canonical_learning_record_projections"
  ADD CONSTRAINT "canonical_learning_record_projections_canonicalRecordId_fkey"
  FOREIGN KEY ("canonicalRecordId") REFERENCES "canonical_learning_records"("canonicalRecordId")
  ON DELETE RESTRICT ON UPDATE CASCADE;

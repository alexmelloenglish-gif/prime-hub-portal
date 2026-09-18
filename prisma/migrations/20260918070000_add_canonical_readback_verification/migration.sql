-- G3 — Canonical read-back verification
CREATE TABLE "canonical_learning_record_verifications" (
    "id" TEXT NOT NULL,
    "verificationKey" TEXT NOT NULL,
    "expectedCanonicalRecordId" TEXT NOT NULL,
    "observedCanonicalRecordId" TEXT,
    "expectedCanonicalVersion" INTEGER NOT NULL,
    "observedCanonicalVersion" INTEGER,
    "expectedCanonicalHash" TEXT NOT NULL,
    "observedCanonicalHash" TEXT,
    "expectedTeacherDecisionId" TEXT NOT NULL,
    "observedTeacherDecisionId" TEXT,
    "expectedSourceReferences" JSONB NOT NULL,
    "observedSourceReferences" JSONB,
    "expectedPedagogicalPayload" JSONB NOT NULL,
    "observedPedagogicalPayload" JSONB,
    "fieldResults" JSONB NOT NULL,
    "mismatchFields" JSONB NOT NULL,
    "verificationStatus" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "canonical_learning_record_verifications_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "canonical_learning_record_verifications_verificationKey_key" ON "canonical_learning_record_verifications"("verificationKey");
CREATE INDEX "canonical_learning_record_verifications_expectedCanonicalRecordId_idx" ON "canonical_learning_record_verifications"("expectedCanonicalRecordId");
CREATE INDEX "canonical_learning_record_verifications_verificationStatus_idx" ON "canonical_learning_record_verifications"("verificationStatus");
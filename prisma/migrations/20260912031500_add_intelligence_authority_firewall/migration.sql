-- NEW INTELLIGENCE authority boundary.
-- This migration intentionally does not alter the frozen legacy pipeline tables.

CREATE TABLE "intelligence_candidate_records" (
    "id" TEXT NOT NULL,
    "candidateKey" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "studentEmail" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceRef" TEXT NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "sourceOccurredAt" TIMESTAMP(3),
    "candidateType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "provenance" JSONB NOT NULL,
    "authorityStatus" TEXT NOT NULL DEFAULT 'candidate',
    "requiresReview" BOOLEAN NOT NULL DEFAULT true,
    "generatedBy" TEXT NOT NULL DEFAULT 'ai',
    "promptVersion" TEXT,
    "processorVersion" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intelligence_candidate_records_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "intelligence_candidate_authority_candidate_only" CHECK ("authorityStatus" = 'candidate'),
    CONSTRAINT "intelligence_candidate_review_always_required" CHECK ("requiresReview" = true)
);

CREATE TABLE "intelligence_review_transitions" (
    "id" TEXT NOT NULL,
    "candidateRecordId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "authorityTransition" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "reviewerRole" TEXT NOT NULL DEFAULT 'teacher',
    "reason" TEXT,
    "reviewedPayload" JSONB,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intelligence_review_transitions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "intelligence_review_decision_allowed" CHECK ("decision" IN ('approved', 'edited', 'rejected')),
    CONSTRAINT "intelligence_review_teacher_only" CHECK ("reviewerRole" = 'teacher'),
    CONSTRAINT "intelligence_review_authority_transition_consistent" CHECK (
      ("decision" IN ('approved', 'edited') AND "authorityTransition" = 'teacher_validated')
      OR
      ("decision" = 'rejected' AND "authorityTransition" = 'teacher_rejected')
    ),
    CONSTRAINT "intelligence_review_edited_payload_required" CHECK (
      "decision" <> 'edited' OR "reviewedPayload" IS NOT NULL
    )
);

CREATE TABLE "intelligence_canonicalizations" (
    "id" TEXT NOT NULL,
    "candidateRecordId" TEXT NOT NULL,
    "reviewTransitionId" TEXT NOT NULL,
    "canonicalRecordKey" TEXT NOT NULL,
    "studentEmail" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "canonicalPayload" JSONB NOT NULL,
    "canonicalizedBy" TEXT NOT NULL,
    "authorityStatus" TEXT NOT NULL DEFAULT 'canonical',
    "canonicalizedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intelligence_canonicalizations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "intelligence_canonicalization_authority_canonical_only" CHECK ("authorityStatus" = 'canonical')
);

CREATE TABLE "intelligence_authorized_projections" (
    "id" TEXT NOT NULL,
    "canonicalizationId" TEXT NOT NULL,
    "projectionKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'authorized_not_projected',
    "authorizedBy" TEXT NOT NULL,
    "authorizedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectedAt" TIMESTAMP(3),
    "targetRef" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intelligence_authorized_projections_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "intelligence_projection_status_allowed" CHECK ("status" IN ('authorized_not_projected', 'projected', 'failed')),
    CONSTRAINT "intelligence_projection_projected_timestamp_consistent" CHECK (
      ("status" = 'projected' AND "projectedAt" IS NOT NULL)
      OR
      ("status" <> 'projected')
    )
);

CREATE UNIQUE INDEX "intelligence_candidate_records_candidateKey_key"
ON "intelligence_candidate_records"("candidateKey");
CREATE INDEX "intelligence_candidate_records_studentEmail_lessonId_idx"
ON "intelligence_candidate_records"("studentEmail", "lessonId");
CREATE INDEX "intelligence_candidate_records_createdAt_idx"
ON "intelligence_candidate_records"("createdAt");

CREATE UNIQUE INDEX "intelligence_review_transitions_candidateRecordId_key"
ON "intelligence_review_transitions"("candidateRecordId");
CREATE INDEX "intelligence_review_transitions_decision_reviewedAt_idx"
ON "intelligence_review_transitions"("decision", "reviewedAt");
CREATE INDEX "intelligence_review_transitions_reviewerId_reviewedAt_idx"
ON "intelligence_review_transitions"("reviewerId", "reviewedAt");

CREATE UNIQUE INDEX "intelligence_canonicalizations_candidateRecordId_key"
ON "intelligence_canonicalizations"("candidateRecordId");
CREATE UNIQUE INDEX "intelligence_canonicalizations_reviewTransitionId_key"
ON "intelligence_canonicalizations"("reviewTransitionId");
CREATE UNIQUE INDEX "intelligence_canonicalizations_canonicalRecordKey_key"
ON "intelligence_canonicalizations"("canonicalRecordKey");
CREATE INDEX "intelligence_canonicalizations_studentEmail_lessonId_idx"
ON "intelligence_canonicalizations"("studentEmail", "lessonId");
CREATE INDEX "intelligence_canonicalizations_canonicalizedAt_idx"
ON "intelligence_canonicalizations"("canonicalizedAt");

CREATE UNIQUE INDEX "intelligence_authorized_projections_canonicalizationId_key"
ON "intelligence_authorized_projections"("canonicalizationId");
CREATE INDEX "intelligence_authorized_projections_status_authorizedAt_idx"
ON "intelligence_authorized_projections"("status", "authorizedAt");

ALTER TABLE "intelligence_review_transitions"
ADD CONSTRAINT "intelligence_review_transitions_candidateRecordId_fkey"
FOREIGN KEY ("candidateRecordId") REFERENCES "intelligence_candidate_records"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "intelligence_canonicalizations"
ADD CONSTRAINT "intelligence_canonicalizations_candidateRecordId_fkey"
FOREIGN KEY ("candidateRecordId") REFERENCES "intelligence_candidate_records"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "intelligence_canonicalizations"
ADD CONSTRAINT "intelligence_canonicalizations_reviewTransitionId_fkey"
FOREIGN KEY ("reviewTransitionId") REFERENCES "intelligence_review_transitions"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "intelligence_authorized_projections"
ADD CONSTRAINT "intelligence_authorized_projections_canonicalizationId_fkey"
FOREIGN KEY ("canonicalizationId") REFERENCES "intelligence_canonicalizations"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- The database itself enforces the authority boundary: a canonical row cannot
-- exist unless a teacher-approved review transition exists for the same candidate.
CREATE OR REPLACE FUNCTION enforce_intelligence_canonicalization_authority()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "intelligence_review_transitions" r
    WHERE r."id" = NEW."reviewTransitionId"
      AND r."candidateRecordId" = NEW."candidateRecordId"
      AND r."decision" IN ('approved', 'edited')
      AND r."authorityTransition" = 'teacher_validated'
      AND r."reviewerRole" = 'teacher'
  ) THEN
    RAISE EXCEPTION 'INTELLIGENCE_AUTHORITY_FIREWALL: teacher-validated review required before canonicalization';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "intelligence_canonicalization_authority_guard"
BEFORE INSERT OR UPDATE ON "intelligence_canonicalizations"
FOR EACH ROW EXECUTE FUNCTION enforce_intelligence_canonicalization_authority();

-- Projection authorization is a distinct transition and cannot be manufactured
-- from a candidate or review row directly.
CREATE OR REPLACE FUNCTION enforce_intelligence_projection_authority()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "intelligence_canonicalizations" c
    JOIN "intelligence_review_transitions" r ON r."id" = c."reviewTransitionId"
    WHERE c."id" = NEW."canonicalizationId"
      AND c."authorityStatus" = 'canonical'
      AND r."decision" IN ('approved', 'edited')
      AND r."authorityTransition" = 'teacher_validated'
      AND r."reviewerRole" = 'teacher'
  ) THEN
    RAISE EXCEPTION 'INTELLIGENCE_PUBLICATION_FIREWALL: canonical teacher-validated authority required before projection authorization';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "intelligence_projection_authority_guard"
BEFORE INSERT OR UPDATE ON "intelligence_authorized_projections"
FOR EACH ROW EXECUTE FUNCTION enforce_intelligence_projection_authority();

-- Candidate, review, and canonicalization history is append-only. Corrections are
-- represented by a new candidate version instead of rewriting provenance.
CREATE OR REPLACE FUNCTION prevent_intelligence_authority_history_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'INTELLIGENCE_AUTHORITY_HISTORY_IMMUTABLE: create a new candidate version instead of rewriting authority history';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "intelligence_candidate_immutable"
BEFORE UPDATE OR DELETE ON "intelligence_candidate_records"
FOR EACH ROW EXECUTE FUNCTION prevent_intelligence_authority_history_mutation();

CREATE TRIGGER "intelligence_review_transition_immutable"
BEFORE UPDATE OR DELETE ON "intelligence_review_transitions"
FOR EACH ROW EXECUTE FUNCTION prevent_intelligence_authority_history_mutation();

CREATE TRIGGER "intelligence_canonicalization_immutable"
BEFORE UPDATE OR DELETE ON "intelligence_canonicalizations"
FOR EACH ROW EXECUTE FUNCTION prevent_intelligence_authority_history_mutation();

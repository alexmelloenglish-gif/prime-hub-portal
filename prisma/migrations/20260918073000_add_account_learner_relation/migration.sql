-- G6 — Account → Learner Authorized Relation
-- Preparation artifact only. This migration is intentionally NOT applied by this branch.
-- Runtime creation/revocation remains server-side and privilege-gated.
--
-- Authority semantics:
--   ACTIVE / REVOKED
--   LEARNER_SELF / AUTHORIZED_ACCESS / OTHER_AUTHORIZED
--   sourceType + sourceReference + authorizedBy + authorizedAt are mandatory.
--
-- Email equality is not represented as a relation source by this table.

CREATE TABLE "account_learner_relations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "relationType" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceReference" TEXT NOT NULL,
    "authorizationHash" TEXT,
    "authorizedBy" TEXT NOT NULL,
    "authorizedAt" TIMESTAMP(3) NOT NULL,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "revokedBy" TEXT,
    "revokedAt" TIMESTAMP(3),
    "revocationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_learner_relations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "account_learner_relations_status_check"
      CHECK ("status" IN ('ACTIVE', 'REVOKED')),
    CONSTRAINT "account_learner_relations_relation_type_check"
      CHECK ("relationType" IN ('LEARNER_SELF', 'AUTHORIZED_ACCESS', 'OTHER_AUTHORIZED')),
    CONSTRAINT "account_learner_relations_validity_check"
      CHECK ("validFrom" IS NULL OR "validUntil" IS NULL OR "validFrom" <= "validUntil"),
    CONSTRAINT "account_learner_relations_revocation_check"
      CHECK (
        ("status" = 'REVOKED' AND "revokedAt" IS NOT NULL)
        OR
        ("status" = 'ACTIVE' AND "revokedAt" IS NULL)
      )
);

CREATE UNIQUE INDEX "account_learner_relations_userId_studentId_key"
ON "account_learner_relations"("userId", "studentId");

CREATE INDEX "account_learner_relations_userId_status_idx"
ON "account_learner_relations"("userId", "status");

CREATE INDEX "account_learner_relations_studentId_status_idx"
ON "account_learner_relations"("studentId", "status");

CREATE INDEX "account_learner_relations_status_validUntil_idx"
ON "account_learner_relations"("status", "validUntil");

ALTER TABLE "account_learner_relations"
ADD CONSTRAINT "account_learner_relations_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "users"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

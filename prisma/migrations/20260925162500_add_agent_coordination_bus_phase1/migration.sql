-- Agent Coordination Bus Phase 1.
-- Durable routing/acknowledgement ledger only. GitHub remains the evidence/authority source.

CREATE TABLE "agent_coordination_events" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "workstreamId" TEXT NOT NULL,
  "senderRole" TEXT NOT NULL,
  "targetRole" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "repo" TEXT NOT NULL,
  "issueNumber" INTEGER,
  "prNumber" INTEGER,
  "sha" TEXT,
  "githubCommentUrl" TEXT,
  "sourceDeliveryId" TEXT NOT NULL,
  "requiresAck" BOOLEAN NOT NULL DEFAULT true,
  "ackStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "acknowledgedBy" TEXT,
  "acknowledgedAt" TIMESTAMP(3),
  "idempotencyKey" TEXT NOT NULL,
  "payloadJson" JSONB,

  CONSTRAINT "agent_coordination_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "agent_coordination_events_idempotencyKey_key"
  ON "agent_coordination_events"("idempotencyKey");

CREATE INDEX "agent_coordination_events_workstreamId_createdAt_idx"
  ON "agent_coordination_events"("workstreamId", "createdAt");

CREATE INDEX "agent_coordination_events_targetRole_ackStatus_createdAt_idx"
  ON "agent_coordination_events"("targetRole", "ackStatus", "createdAt");

CREATE INDEX "agent_coordination_events_repo_prNumber_sha_idx"
  ON "agent_coordination_events"("repo", "prNumber", "sha");

CREATE INDEX "agent_coordination_events_repo_issueNumber_createdAt_idx"
  ON "agent_coordination_events"("repo", "issueNumber", "createdAt");

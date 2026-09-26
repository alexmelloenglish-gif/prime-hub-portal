-- Agent Coordination Bus Phase 2 — active claim/lease + dispatch observability.
-- Additive only. Does not activate any external dispatcher by itself.

ALTER TABLE "agent_coordination_events"
  ADD COLUMN "claimedBy" TEXT,
  ADD COLUMN "claimedAt" TIMESTAMP(3),
  ADD COLUMN "leaseExpiresAt" TIMESTAMP(3),
  ADD COLUMN "dispatchAttempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lastDispatchAt" TIMESTAMP(3),
  ADD COLUMN "lastDispatchError" TEXT;

CREATE INDEX "agent_coordination_events_targetRole_ackStatus_leaseExpiresAt_createdAt_idx"
  ON "agent_coordination_events"("targetRole", "ackStatus", "leaseExpiresAt", "createdAt");

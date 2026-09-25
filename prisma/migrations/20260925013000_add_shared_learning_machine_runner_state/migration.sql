-- Shared PRIME Learning Machine runner + durable run-history state.
-- Additive only: preserves all historical PipelineRun rows and legacy behavior.

ALTER TABLE "pipeline_runs"
  ADD COLUMN "executionMode" TEXT NOT NULL DEFAULT 'legacy',
  ADD COLUMN "normalizedRunIdentity" TEXT,
  ADD COLUMN "machineVersion" TEXT,
  ADD COLUMN "machineContractVersion" TEXT,
  ADD COLUMN "currentStage" TEXT,
  ADD COLUMN "resumePoint" TEXT,
  ADD COLUMN "finalManifest" JSONB;

CREATE INDEX "pipeline_runs_executionMode_status_idx"
  ON "pipeline_runs"("executionMode", "status");

CREATE INDEX "pipeline_runs_normalizedRunIdentity_idx"
  ON "pipeline_runs"("normalizedRunIdentity");

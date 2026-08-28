-- A Transcript is the canonical lesson/source record. PipelineRun rows are
-- immutable processing attempts that may safely share that transcript.
ALTER TABLE "pipeline_runs"
ADD COLUMN "transcriptId" TEXT,
ADD COLUMN "attemptNumber" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "evidence_candidates" ADD COLUMN "pipelineRunId" TEXT;

-- Expand phase: the deployed pre-migration application still writes this
-- legacy column until the new application version is promoted.
ALTER TABLE "transcripts" ALTER COLUMN "pipelineRunId" DROP NOT NULL;

-- Preserve every historical association before removing the legacy 1:1 FK.
UPDATE "pipeline_runs" AS run
SET "transcriptId" = transcript."id"
FROM "transcripts" AS transcript
WHERE transcript."pipelineRunId" = run."id";

UPDATE "evidence_candidates" AS candidate
SET "pipelineRunId" = transcript."pipelineRunId"
FROM "transcripts" AS transcript
WHERE candidate."transcriptId" = transcript."id";

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "pipeline_runs" WHERE "transcriptId" IS NULL) THEN
    RAISE EXCEPTION 'Cannot migrate pipeline attempts: a pipeline run has no historical transcript';
  END IF;
  IF EXISTS (SELECT 1 FROM "evidence_candidates" WHERE "pipelineRunId" IS NULL) THEN
    RAISE EXCEPTION 'Cannot migrate pipeline attempts: an evidence candidate has no historical pipeline run';
  END IF;
END $$;

CREATE UNIQUE INDEX "evidence_candidates_pipelineRunId_candidateKey_key"
ON "evidence_candidates"("pipelineRunId", "candidateKey");
CREATE INDEX "evidence_candidates_transcriptId_idx" ON "evidence_candidates"("transcriptId");
CREATE UNIQUE INDEX "pipeline_runs_transcriptId_attemptNumber_key"
ON "pipeline_runs"("transcriptId", "attemptNumber");
ALTER TABLE "pipeline_runs"
ADD CONSTRAINT "pipeline_runs_transcriptId_fkey"
FOREIGN KEY ("transcriptId") REFERENCES "transcripts"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "evidence_candidates"
ADD CONSTRAINT "evidence_candidates_pipelineRunId_fkey"
FOREIGN KEY ("pipelineRunId") REFERENCES "pipeline_runs"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- The legacy transcripts.pipelineRunId column and its unique index/FK are
-- intentionally retained during this online expand phase. The Prisma model
-- no longer reads or writes them. A later contract migration may remove them
-- after production verification without affecting retry semantics.

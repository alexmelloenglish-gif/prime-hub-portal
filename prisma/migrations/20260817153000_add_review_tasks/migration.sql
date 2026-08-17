CREATE TABLE IF NOT EXISTS "review_tasks" (
    "id" TEXT NOT NULL,
    "pipelineRunId" TEXT NOT NULL,
    "studentEmail" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'identity_review_required',
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "decision" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_tasks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "review_tasks_pipelineRunId_stage_key" ON "review_tasks"("pipelineRunId", "stage");
CREATE INDEX IF NOT EXISTS "review_tasks_stage_createdAt_idx" ON "review_tasks"("stage", "createdAt");
CREATE INDEX IF NOT EXISTS "review_tasks_studentEmail_createdAt_idx" ON "review_tasks"("studentEmail", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'review_tasks_pipelineRunId_fkey'
  ) THEN
    ALTER TABLE "review_tasks"
      ADD CONSTRAINT "review_tasks_pipelineRunId_fkey"
      FOREIGN KEY ("pipelineRunId") REFERENCES "pipeline_runs"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Durable idempotency for Google Drive source files.
-- The column is nullable so legacy/manual/API transcripts remain valid.
ALTER TABLE "transcripts"
  ADD COLUMN IF NOT EXISTS "sourceFileId" TEXT;

-- Backfill only the first transcript row for each source file. Duplicate legacy
-- rows remain nullable and cannot block the unique index; future submissions
-- are bound to the canonical first row and return duplicate=true.
WITH candidates AS (
  SELECT
    t."id",
    NULLIF(t."metadata"->>'sourceFileId', '') AS source_file_id,
    ROW_NUMBER() OVER (
      PARTITION BY NULLIF(t."metadata"->>'sourceFileId', '')
      ORDER BY t."createdAt" ASC, t."id" ASC
    ) AS row_number
  FROM "transcripts" t
  WHERE t."metadata" IS NOT NULL
    AND jsonb_typeof(t."metadata") = 'object'
    AND NULLIF(t."metadata"->>'sourceFileId', '') IS NOT NULL
)
UPDATE "transcripts" AS t
SET "sourceFileId" = c.source_file_id
FROM candidates AS c
WHERE t."id" = c."id"
  AND c.row_number = 1;

CREATE UNIQUE INDEX IF NOT EXISTS "transcripts_sourceFileId_key"
  ON "transcripts"("sourceFileId");

CREATE INDEX IF NOT EXISTS "transcripts_sourceFileId_idx"
  ON "transcripts"("sourceFileId");

COMMENT ON COLUMN "transcripts"."sourceFileId" IS
  'Immutable Google Drive source file ID used for durable ingestion idempotency; nullable for legacy/manual/API transcripts.';

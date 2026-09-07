CREATE TABLE "vocabulary_reuse_sentences" (
    "id" TEXT NOT NULL,
    "studentId" TEXT,
    "studentEmail" TEXT NOT NULL,
    "vocabularyKey" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "sentence" TEXT NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vocabulary_reuse_sentences_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "vocabulary_reuse_sentences_studentEmail_vocabularyKey_createdAt_idx"
ON "vocabulary_reuse_sentences"("studentEmail", "vocabularyKey", "createdAt");

CREATE TABLE "audio_mission_submissions" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "studentEmail" TEXT NOT NULL,
  "actionId" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "audioBase64" TEXT NOT NULL,
  "durationSeconds" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'submitted',
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  "reviewerId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "audio_mission_submissions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audio_mission_submissions_studentId_actionId_submittedAt_idx" ON "audio_mission_submissions"("studentId", "actionId", "submittedAt");
CREATE INDEX "audio_mission_submissions_status_submittedAt_idx" ON "audio_mission_submissions"("status", "submittedAt");

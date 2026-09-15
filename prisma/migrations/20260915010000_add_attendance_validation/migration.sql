CREATE TABLE "attendance_records" (
  "id" TEXT NOT NULL,
  "lessonId" TEXT NOT NULL,
  "studentEmail" TEXT NOT NULL,
  "studentId" TEXT,
  "studentName" TEXT,
  "teacherId" TEXT,
  "teacherName" TEXT,
  "status" TEXT NOT NULL DEFAULT 'unknown',
  "authorityStatus" TEXT NOT NULL DEFAULT 'not_proven',
  "source" TEXT NOT NULL,
  "sourceReference" TEXT NOT NULL,
  "meetingId" TEXT,
  "conferenceRecordId" TEXT,
  "participantId" TEXT,
  "participantUserId" TEXT,
  "scheduledStartAt" TIMESTAMP(3),
  "scheduledEndAt" TIMESTAMP(3),
  "conferenceStartAt" TIMESTAMP(3),
  "conferenceEndAt" TIMESTAMP(3),
  "participantStartAt" TIMESTAMP(3),
  "participantEndAt" TIMESTAMP(3),
  "reconciledAt" TIMESTAMP(3),
  "evidence" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "attendance_records_lessonId_studentEmail_key" ON "attendance_records"("lessonId", "studentEmail");
CREATE INDEX "attendance_records_studentEmail_scheduledStartAt_idx" ON "attendance_records"("studentEmail", "scheduledStartAt");
CREATE INDEX "attendance_records_authorityStatus_status_idx" ON "attendance_records"("authorityStatus", "status");
CREATE INDEX "attendance_records_conferenceRecordId_idx" ON "attendance_records"("conferenceRecordId");

CREATE TABLE "validation_tasks" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "priority" INTEGER NOT NULL DEFAULT 0,
  "studentEmail" TEXT,
  "lessonId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "evidence" JSONB NOT NULL,
  "suggestedValue" JSONB,
  "reviewerId" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "decision" TEXT,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "validation_tasks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "validation_tasks_type_entityType_entityId_key" ON "validation_tasks"("type", "entityType", "entityId");
CREATE INDEX "validation_tasks_status_priority_createdAt_idx" ON "validation_tasks"("status", "priority", "createdAt");
CREATE INDEX "validation_tasks_studentEmail_status_idx" ON "validation_tasks"("studentEmail", "status");
CREATE INDEX "validation_tasks_lessonId_status_idx" ON "validation_tasks"("lessonId", "status");

# PRIME Digital Hub — Google Drive → Google Workspace Studio Flow → Human Review → Dashboard

**Status:** architecture reconciliation, 17 August 2026

## 1. Confirmed operating assumption

The source of truth for lesson ingestion is Google Workspace: Google Meet produces the transcript, the transcript is saved in a controlled Google Drive folder, and the user already has a Google-native Flow/Studio service that should orchestrate the next steps. PRIME must not create a parallel Slack/email-first automation that competes with this Flow.

The Google Flow is the orchestration trigger. It is not the authority to publish student-facing facts. The Flow may detect a new transcript, validate metadata, submit an ingestion request, and notify the teacher that a human review is waiting. The PRIME application remains responsible for stateful review decisions, idempotency, authorization, and publication into approved projections.

## 2. What is already present in the repository

The repository contains a controlled Drive scanner in `scripts/scan-drive-transcripts.mjs`. It can list a configured folder, read supported Google Docs/text/VTT/JSON files, calculate provenance and hashes, derive a stable lesson key, and optionally submit to `POST /api/pipeline/ingest`. Dry-run is the default. The scanner is not, by itself, a continuous webhook or Google Flow integration.

The ingestion route is `POST /api/pipeline/ingest`. In production it requires the `x-prime-pipeline-secret` header and accepts at minimum `lessonId`, `studentEmail`, and `transcript`. It also accepts teacher, source, timestamps, attendance, meeting, and metadata fields.

The Prisma schema already stores transcripts, evidence candidates, learning-signal proposals, teacher-insight proposals, class-report projections, portfolio projections, coaching guidance, pipeline runs, and pipeline events. These tables are useful foundations for a review queue, but there is currently no reviewer-decision table, notification-delivery table, review-task state machine, or admin review UI.

## 3. Required Google-native handoff

The existing Flow must perform the following logical steps:

| Flow step | Required behavior | PRIME boundary |
|---|---|---|
| Drive trigger | Detect a new or changed transcript in the controlled folder. | Preserve the Drive file ID and modification time. |
| Read source | Read the Google Doc or supported transcript file without moving or deleting it. | Preserve source URL, MIME type, hash, and timestamps. |
| Identity routing | Resolve the student through an approved mapping, not the filename alone. | Reject ambiguous or unknown identity. |
| Metadata validation | Confirm student, teacher, lesson date, meeting/source ID, and transcript availability. | Create a blocked review item if metadata is incomplete. |
| Submit | Call `POST /api/pipeline/ingest` or invoke an Apps Script custom step that calls it. | Use the pipeline secret outside transcript content; do not expose it to the student. |
| Notify | Send a Google Chat/Workspace notification to Alexandre Mello that review is ready. | Notification is informational; it cannot approve or publish. |
| Review handoff | Link to the authenticated PRIME Admin Review Queue. | All approval decisions occur inside PRIME. |

Google Workspace Studio supports custom steps implemented through Apps Script, which is the preferred bridge if the current Flow does not provide a secure direct HTTP action. The exact Flow configuration still needs to be inspected; search results and repository code do not prove that the user’s existing Flow currently calls the PRIME endpoint.

## 4. Required payload

A Flow or custom Apps Script step should submit a payload equivalent to:

```json
{
  "lessonId": "stable-lesson-id",
  "studentId": "stu_cce1337c71da",
  "studentEmail": "rafael.copolillo@gmail.com",
  "studentName": "Rafael Copolillo",
  "teacherId": "teacher_alexandre_mello_v1",
  "teacherName": "Alexandre Mello",
  "transcript": "original transcript text",
  "transcriptId": "drive-file-or-doc-id",
  "externalMeetingId": "google-meet-id-if-available",
  "source": "google_meet",
  "effectiveAt": "2026-08-17T15:00:00-03:00",
  "recordedAt": "2026-08-17T15:00:00-03:00",
  "attendanceStatus": "unknown",
  "attendanceSource": "google_meet_or_explicit_teacher_input",
  "metadata": {
    "sourceFileId": "drive-file-id",
    "sourceDocumentUrl": "https://docs.google.com/document/d/...",
    "sourceMimeType": "application/vnd.google-apps.document",
    "sourceHash": "sha256",
    "driveFolderId": "controlled-folder-id"
  }
}
```

The Flow must not infer attendance solely from transcript text. It must not use a filename as the only identity signal. The source file must remain in Drive, and the original content must remain available for audit.

## 5. Critical current implementation gap

The current `processLessonTranscript()` executes Prompt 1, Prompt 2, Prompt 3, and Prompt 4 in one request. It persists proposals, writes a class-report projection, applies the portfolio patch, creates coaching guidance, and marks the pipeline run as completed. The existing code therefore does not yet pause at human approval gates before applying all changes.

For the accepted architecture, ingestion must end in `review_required`, not `completed`. Prompt 1 and Prompt 2 outputs must become reviewable proposals. Prompt 3 must be stored as a proposed patch and must not be applied until the teacher approves the relevant review stage. Prompt 4 must be stored as a coaching proposal and must not become a pedagogical decision until approval.

## 6. Required PRIME review states

The minimum state machine is:

`received` → `identity_review_required` → `evidence_review_required` → `report_review_required` → `projection_review_required` → `coaching_review_required` → `approved_for_publication` → `published`.

Any stage may move to `rejected`, `needs_revision`, `blocked_identity`, `blocked_source`, or `failed`. A rejected or blocked item must never be visible as authoritative student data.

Each transition must record reviewer identity, timestamp, previous state, next state, decision reason, source run, and a stable event ID. A second approval attempt must be idempotent and must not duplicate projection operations.

## 7. Required UI and notification behavior

The admin page needs a real Review Queue, not only a student directory. It must show one card per lesson run with student, lesson date, source file, current state, source hash, transcript link, and the pending decision. Each card must provide `Approve`, `Reject`, `Request revision`, and `Open source` actions with confirmation and a required reason for rejection/revision.

The sidebar needs a pending-review count. The teacher should receive a Google Chat/Workspace notification from the Flow when a new review task is created, with a link to the queue. Email can be a fallback, but it is not the primary orchestration channel under this architecture. Slack should not be required for the Google-native flow.

## 8. Safe sequence for the two validation lessons

For the 15:00 lesson and the 19:00 lesson, the Flow must create two independent runs and two independent review tasks. The teacher verifies the first card before processing the second; the system must never combine the transcripts. The teacher then approves each stage in order. Only after the final approval should the authorized publication service update PostgreSQL/Firestore projections and the student dashboard.

If the teacher does nothing, the item remains pending and no student-facing update occurs. If the teacher rejects, the item remains non-authoritative and the Flow may notify that revision is required. If a version conflict occurs, publication stops and the item becomes blocked for reconciliation.

## 9. What must be inspected from the existing Flow

Before claiming that the Google-native automation is working, inspect or provide the existing Flow’s configuration: its exact product name and URL, Drive trigger, source folder, identity-routing rule, Apps Script/custom step or HTTP action, authentication mechanism, PRIME endpoint, notification destination, and retry behavior. Do not share private tokens or credentials.

## References

[1]: https://workspace.google.com/studio/ "Google Workspace Studio"
[2]: https://developers.google.com/workspace/add-ons/studio "Extend Google Workspace Studio"
[3]: https://developers.google.com/workspace/add-ons/studio/build-a-step "Build a custom Workspace Studio step"
[4]: https://developers.google.com/workspace/drive/api/guides/events-overview "Google Drive API Events overview"
[5]: https://developers.google.com/workspace/events/guides/events-drive "Google Workspace Events for Drive"
[6]: https://developers.google.com/workspace/meet/api/reference/rest/v2/conferenceRecords.transcripts.entries/get "Google Meet transcript entries"


## 2026-08-17 observed source-folder reality

The authenticated Drive folder `1p7u86xfGCRkbSBiNgSZMnUNO5j4S5vMw` currently contains five Google Docs. The folder is not yet a safe blind-processing queue because the documents have different levels of provenance and transcript completeness:

- The Louise document from 2026-08-10 is a viable full-content candidate and includes a long Gemini meeting record reaching at least 00:56:22, but it still requires Prompt 1 identity/evidence review.
- The Louise document from 2026-08-17 00:09 contains a notice that there was not enough conversation in a supported language and no usable body transcript. It must be held, not processed as a lesson.
- The Rafael document from 2026-08-13 contains the same insufficient-conversation notice and no substantive transcript body. The linked meeting-record transcript must be found before processing.
- The English and Portuguese documents for the 2026-08-16 23:15 meeting are visible in Drive listing, but authenticated individual reads return `Requested entity was not found`/404 even though Drive metadata confirms the files exist and are owned by `alexandre@primedigitalhub.com.br`. They must remain quarantined until the API/access discrepancy is resolved.

Therefore the Google Flow must implement an explicit **source triage step** before calling `/api/pipeline/ingest`: `usable_transcript`, `insufficient_transcript`, `identity_required`, `source_read_error`, or `duplicate`. Only `usable_transcript` may enter Prompt 1 automatically. All other states create a human-review task or an operational alert and must not mutate student projections.

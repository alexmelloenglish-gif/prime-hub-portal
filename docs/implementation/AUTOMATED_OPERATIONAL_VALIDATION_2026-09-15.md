# Automated Operational Validation — 2026-09-15

## Decision

PRIME must stop treating every operational gap as a pedagogical review problem.

The runtime will distinguish two classes of truth:

### Operational truth — eligible for automatic reconciliation

- authorized learner identity
- scheduled lesson identity
- meeting identity
- attendance
- source provenance
- processing state
- timestamps
- artifact provenance

### Pedagogical truth — remains teacher-authorized

- Evidence
- Assessment
- Teacher Insight
- Pedagogical Decision
- Educational Action
- Learning State changes

The system may automatically establish operational truth when it has an authorized source. It must never infer pedagogical truth from technical artifacts.

## Attendance — canonical rule

A transcript is **not** an attendance authority.

Attendance becomes `PROVEN` only when a canonical AttendanceRecord is created from an authorized attendance source.

The preferred source is Google Meet REST API conference/participant data. Google documents that Meet provides conference records, participant records, participant sessions, and join/leave timestamps. The participant resource explicitly represents a person who attended or is attending a conference. Required read access includes `meetings.space.readonly` (or `meetings.space.created`, where applicable).

Source: Google Meet REST API participant documentation.

## Canonical AttendanceRecord

Implement a canonical attendance record with at least:

```text
attendance_id
lesson_id
student_id
student_email
teacher_id
scheduled_start
scheduled_end
conference_record_id
participant_record_id
participant_session_ids[]
first_joined_at
last_left_at
attendance_status: attended | missed | cancelled | rescheduled | unknown
attendance_source: google_meet
authority_status: authoritative | non_authoritative
source_reference
reconciled_at
```

### Automatic decision rule

Do NOT invent a duration threshold in code.

The first implementation must establish attendance from an explicit, deterministic business rule stored as configuration/documented policy. The rule must match the student identity to a signed-in Meet participant where possible and use participant join/leave timestamps. Anonymous/phone participants must not silently become an identity match.

If the identity cannot be resolved safely, status remains `unknown` and enters Validation Queue.

If the canonical source explicitly establishes the participant and conference, the record may be marked `authority_status=authoritative` and `attendance_status=attended` without teacher confirmation.

## Reconciliation flow

```text
Google Calendar / lesson registry
          ↓
scheduled lesson
          ↓
Google Meet conference record
          ↓
participants + participant sessions
          ↓
identity reconciliation
          ↓
Canonical AttendanceRecord
          ↓
attendance PROVEN
          ↓
Pipeline / Portfolio / Dashboard
```

Calendar/booking alone proves scheduling, not attendance.
Transcript alone proves source availability, not attendance.
Meet participant records can establish attendance when identity reconciliation succeeds.

## Validation Queue

Add a first-class Teacher Intelligence section named `Validation`.

It is the operational exception queue, not a second pedagogical review queue.

Each item must show:

- entity type
- learner
- lesson
- current status
- source evidence
- authority status
- reason unresolved
- available resolution actions
- audit history

Initial operational validation types:

1. attendance identity unresolved
2. scheduled lesson unmatched
3. meeting/conference unmatched
4. learner identity unresolved
5. source provenance unresolved
6. effective date unresolved
7. orphaned operational event

Resolution actions must be explicit and auditable. No UI action may silently convert a proposal into canonical pedagogical truth.

## Review boundary

`Review` remains for pedagogical candidates:

```text
Evidence Candidate → teacher review → canonical Evidence
```

`Validation` resolves operational authority:

```text
Operational source → reconciliation → canonical operational record
```

Do not merge the two queues semantically.

## Existing runtime compatibility

The current contracts already contain:

- `AttendanceStatus`
- `attendanceStatus`
- `attendanceSource`
- `externalMeetingId`
- `upsert_attendance_projection`

Therefore this work should extend the existing canonical path rather than create a parallel attendance model.

## Required implementation

1. Add a canonical attendance persistence model/table if one does not already exist.
2. Add Google Meet REST API access using an authorized Google credential path already used by PRIME where possible.
3. Add conference/participant reconciliation service.
4. Resolve signed-in participant identity against the canonical learner directory.
5. Persist an auditable AttendanceRecord.
6. Make the existing pipeline consume the canonical attendance result.
7. Add `Validation` to Teacher Intelligence for unresolved operational exceptions.
8. Add idempotent reconciliation so repeated runs do not duplicate attendance.
9. Add audit events for `AttendanceReconciled`, `AttendanceUnresolved`, and manual resolution.
10. Backfill/reconcile existing lessons where the Meet source is available.
11. Keep `NOT PROVEN` for records where the source cannot actually establish the fact. Never mass-convert existing warnings merely to make the dashboard green.

## Acceptance criteria

### Attendance

- A real Google Meet conference with a safely matched signed-in learner produces `attendance_status=attended`, `attendance_source=google_meet`, and `authority_status=authoritative`.
- The trace displays the source conference and participant/session evidence.
- Re-running reconciliation is idempotent.
- Transcript existence alone cannot produce authoritative attendance.
- Anonymous/ambiguous participants remain unresolved rather than being guessed.

### Validation

- Every unresolved operational item has one visible destination: `Teacher Intelligence → Validation`.
- Every resolution is auditable.
- Validation does not manufacture Evidence, Assessment, Insight, Decision, Action, or Learning State.

### Governance

- Technical processing success does not imply pedagogical validity.
- Published projection does not imply assessment.
- Attendance proof does not imply learning proof.
- Teacher authority remains intact for pedagogical states.

## Definition of done

This work is DONE only when the implementation is deployed and a real production trace demonstrates:

```text
lesson
 → scheduled identity
 → Meet conference
 → participant identity
 → AttendanceRecord(authoritative)
 → attendance PROVEN
 → pipeline consumes attendance
 → audit trail preserved
```

Until that trace exists, the architecture may be implemented but attendance is not yet proven in production.

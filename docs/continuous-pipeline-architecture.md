# PRIME Digital Hub — Continuous Transcript-to-Dashboard Architecture

**Document status:** Proposed implementation baseline  
**Scope:** Google Meet transcript → canonical processing → human review → student dashboard  
**Products:** Rafael’s existing dashboard remains the reference product; Louise is onboarded into the same product path.  
**Author:** Manus AI

## 1. Executive decision

The student-facing product is the **dashboard**. A Google Docs portfolio is an internal management resource and an evidence/content source; it is not the product delivered to the student. GitHub publishes application code, while Firestore and PostgreSQL publish lesson data. A lesson must not require a GitHub commit to become visible after approval.

The production system will use the existing Next.js/Vercel application as the control surface, PostgreSQL/Prisma as the workflow and projection store, and Firestore as the student-profile/dashboard source already proven by Rafael’s live dashboard. The Drive transcript folder is the ingestion source. The dashboard will read the canonical student profile and the approved pipeline projections; it will never render raw Prompt 1 output as official content.

## 2. Source-of-truth matrix

| Data or decision | Authoritative source | Who may change it | Student-facing effect |
|---|---|---|---|
| Student identity, profile, own links | Firestore `students/{documentId}` | Authorized profile service/admin | Profile and management links |
| Raw transcript | PostgreSQL `Transcript` | Ingestion service | Never shown as official learning content by default |
| Evidence candidates | `EvidenceCandidate` | Prompt 1 plus review service | None until accepted |
| Validated evidence | Review/service decision derived from candidates | Teacher/admin approval | Supports class report and recommendations |
| Learning signals | `LearningSignalProposal` plus approval decision | Review/service decision | Supports pedagogical projections |
| Teacher insight | `TeacherInsightProposal` after explicit publication | Teacher/admin only | Teacher feedback and report content |
| Class report | `ClassReportProjection` | Prompt 2 projection service, then human publication gate | Lesson report |
| Longitudinal dashboard projection | `PortfolioProjection` | Deterministic projection service after authorized inputs | Progress, vocabulary, corrections, attendance |
| Coaching guidance | `CoachingGuidance` | Prompt 4 proposal plus human approval | Teacher-facing guidance; never an autonomous pedagogical decision |
| Application code | GitHub repository and successful Vercel deployment | Repository maintainers | Makes the software path available |

## 3. Canonical causal chain

The canonical chain is deliberately split into non-authoritative proposal generation, authorized services, projections, and publication:

```text
Drive transcript discovered
        ↓
Ingestion + idempotency + raw Transcript persistence
        ↓
Prompt 1: non-authoritative evidence/signal/insight proposals
        ↓
Evidence service: candidate review and validation
        ↓
Signal service: evidence-backed learning-signal validation
        ↓
Insight service: teacher insight review/publication
        ↓
Prompt 2: Class Report projection draft using only authorized inputs
        ↓
Human class-report publication gate
        ↓
Deterministic portfolio projection service + Prompt 3 patch contract
        ↓
Prompt 4 recommendation-only guidance using authorized published inputs
        ↓
Human coaching/publication gate
        ↓
Firestore/Prisma dashboard projections become visible
```

Prompt 1 may propose. It may not publish, mutate a student profile, decide attendance, or create an official learning state. Prompt 2 may project a class report, but it may not invent validated evidence or publish a teacher decision. Prompt 3 may describe an idempotent projection patch, but only the deterministic projection service may apply it. Prompt 4 may recommend, but it may not make a pedagogical decision or mutate the dashboard directly.

## 4. Human review experience

The teacher uses one internal review queue rather than editing raw JSON or running terminal commands. Each incoming lesson receives an **identity review** card with the transcript identity, student, date, source link, and Prompt 1 evidence candidates. Prompt 2–4 do not run until this first decision is approved.

After identity approval, Prompts 2–4 generate draft-only class-report, portfolio-patch, and coaching artifacts. The same pipeline then creates a separate **publication review** task. Until that second decision is approved, the class report remains `draft`, the portfolio patch remains `pending_publication_review`, and the student dashboard ignores the projection.

The review actions are intentionally explicit:

| Review action | Resulting state | Does it publish to the student dashboard? |
|---|---|---|
| Approve identity/source review | Prompts 2–4 may run; artifacts remain draft | No |
| Reject identity/source review | Run becomes auditable and stopped | No |
| Review publication draft | Teacher inspects the generated class report and proposed patch | No |
| Approve publication | Report becomes `published` and the idempotent portfolio patch is applied | Yes, for the allowed lesson-report and portfolio projection |
| Reject publication | Draft remains non-authoritative and no student-facing projection is applied | No |
| Approve coaching guidance | Guidance remains teacher-facing and subject to its own status contract | No student-facing authority |

Every action records reviewer identity, timestamp, previous state, next state, reason, and the source pipeline run. No button directly writes arbitrary JSON to Firestore. The dashboard loader also applies a defensive `projection_published` filter, so an accidental draft reference cannot become student-visible.

## 5. Operational states

The minimum workflow states are:

```text
RECEIVED → PROCESSING → IDENTITY_REVIEW_REQUIRED
        → PROCESSING_APPROVED → REPORT_DRAFTED
        → PUBLICATION_REVIEW_REQUIRED → PUBLISHING
        → COMPLETED

Any review stage may transition to REVIEW_REJECTED or PUBLICATION_REJECTED.
A failed continuation remains auditable as PROCESSING_APPROVED and can be retried from the queue without re-ingesting the transcript.
```

Failure, rejection, and retry are separate states and must not be represented by silent fallback:

```text
PROCESSING → FAILED → RETRYABLE / BLOCKED
AWAITING_REVIEW → REJECTED → REVISION_REQUIRED
```

Idempotency is based on normalized student email, stable lesson ID, and transcript/external ID. A repeated Drive scan must never create a second lesson, duplicate class report, or duplicate portfolio operation.

## 6. Automation options

The implementation should support a low-maintenance hosted timer first and preserve a simpler manual recovery path.

| Approach | Tradeoffs | Cost | Setup complexity |
|---|---|---:|---:|
| Hosted timer calling a secured scan endpoint | Best fit for the existing production app; no browser or Cloud Shell needed. Requires storing Drive OAuth/service credentials as server-side secrets and renewing Drive notification channels if push is added. | Usage-based hosting; no separate worker required at modest volume | Medium |
| GitHub scheduled workflow | Familiar and easy to inspect in GitHub; useful as a recovery/fallback runner. Scheduled jobs can be delayed or skipped, and runtime secrets must be configured in GitHub. | Usually included within repository quotas, subject to account limits | Low–medium |
| Dedicated always-on worker | Strongest control for frequent polling and queue processing; adds operational cost and another deployment to maintain. | Separate hosting cost | High |

The recommended baseline is the **hosted timer plus a GitHub recovery workflow**. A timer wakes the scanner every few minutes, but the scanner remains idempotent and performs a reconciliation scan. Official Google Drive push notifications exist for `files` and `changes`, but channels expire and require manual renewal; the Drive Events API is currently a Developer Public Preview. Therefore, event notifications may reduce latency later, but reconciliation polling remains the correctness mechanism.[1] [2]

## 7. Security and access

The browser login is not the automation mechanism. Human access must use Google 2-Step Verification and recovery methods. A second trusted human account should be granted an explicitly approved project role. Runtime automation must use Vercel OIDC exchanged through Google Workload Identity Federation and a dedicated, least-privilege service identity. The implementation must not depend on creating new Service Account keys. A static key may exist only as a pre-approved, temporary emergency rollback credential stored in secret storage with a documented key ID, minimum scope, rotation date, and immediate revocation condition; it must never be stored in the repository, transcript documents, or chat messages.

The Vercel project must be connected to the intended GitHub repository and `main` branch. The current failed deployment was blocked because the project required verified commits while the current commit was unverified. The team must either configure verified Git commits or consciously disable that protection; this is a deployment-governance decision, not a code fix.

The production environment must contain, at minimum, server-side values for the intended Firebase project, Firestore Admin identity, Prisma database, pipeline ingest secret, and AI provider. A health check must report only presence/absence and project identifiers, never secret values.

## 8. Definition of done

The implementation is complete only when all of the following are true:

1. The live domain is served by the intended Vercel project and a successful deployment from the current `main` branch.
2. Rafael’s existing dashboard still renders the correct historical content and shows Firestore as its profile source.
3. Louise appears in the same student-selection/admin experience and her dashboard uses her own profile and links.
4. A new Drive transcript is discovered without a browser session, persisted once, and appears in the human review queue.
5. Prompt 1 output remains non-authoritative; Prompt 2–4 inputs contain only authorized validated records and published references.
6. A reviewer can approve or reject each publication boundary from the portal.
7. Approved changes update the Prisma projections and dashboard data without requiring a GitHub commit.
8. Re-running the scanner or approval action is safe and produces no duplicate lesson/report/patch.
9. A documented recovery path exists for the primary administrator, Vercel, Firebase, database, Drive access, and pipeline secrets.
10. A full test run records the transcript ID, pipeline run ID, review decision IDs, projection version, and dashboard verification URL.

## References

[1]: https://developers.google.com/workspace/drive/api/guides/push "Google Drive API — Notifications for resource changes"

[2]: https://workspaceupdates.googleblog.com/2025/07/google-drive-events-api-now-available.html "Google Workspace Updates — Google Drive Events API developer public preview"

[3]: https://developers.google.com/workspace/meet/api/reference/rest/v2/conferenceRecords.transcripts.entries/get "Google Meet API — transcript entries"

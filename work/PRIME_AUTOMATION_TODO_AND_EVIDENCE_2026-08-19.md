# PRIME Digital Hub — Automation To-Do and Evidence Checklist

**Purpose.** Establish whether the transcript automation works from Google Meet/Drive through canonical processing, one consolidated Teacher Insight validation, notification, and the correct student dashboard, without manual staging or unverified claims.

## 1. Verified completed

| Area | Evidence | Status |
|---|---|---|
| Canonical PRIME Next.js tree | Known-good dashboard tree restored; incompatible spreadsheet prototype API removed | Verified |
| Vercel build repair | Explicit npm install path, real Next/Prisma build, stale pnpm lockfile removed | Verified |
| Production deployment | Deployment `e3c3f1c` reached READY | Verified |
| Vercel project association | `www.primedigitalhub.com.br` accepted for the `prime-hub-portal` project | Verified at project level |
| Old DNS record removal | Registro.br displayed `Zona DNS atualizada com sucesso!` after removing `www -> cname.vercel-dns-0.com` | Verified |
| Student repository fallback | Ten student profiles exist in the repository fallback | Verified from prior audit |
| Dashboard layout and typography | Production layout fixes were deployed in prior commits | Verified from prior audit |

## 2. Current blockers

| Blocker | Exact condition | Consequence |
|---|---|---|
| Replacement DNS record | Registro.br still needs one clean save for `www CNAME acda3b8dac47c744.vercel-dns-017.com.` | Official domain may continue to return Vercel `404 NOT_FOUND` |
| Registro.br session | The browser session was reset to the login page after a JavaScript-shell/extension timeout | The replacement CNAME cannot be entered until the account is authenticated again |
| Official route proof | The canonical endpoint has not yet been re-tested successfully through the official domain after DNS propagation | Vercel deployment readiness is not the same as public reachability |
| Google Workspace Studio trigger | No PRIME-specific Drive-to-ingestion Flow has been proven active | A transcript in Drive does not yet demonstrably trigger PRIME processing |
| Canonical ingestion proof | No controlled test has shown a new Drive transcript causing `/api/pipeline/ingest` to create a canonical run | End-to-end automation remains unproven |
| Review database/UI | `review_tasks` was identified as not applied in the prior production audit | Consolidated Teacher Insight review may fail or remain unavailable |
| Notification | No verified email/Chat notification has been demonstrated after transcript arrival | Teacher may not be informed automatically |
| Production identity mode | Firestore/WIF configuration was not proven active in production; repository fallback remains the known safe path | Publication and student isolation need explicit production testing |

## 3. To-do list in execution order

### A. Restore the official production route

1. Authenticate the Registro.br session.
2. Open the zone editor for `primedigitalhub.com.br`.
3. Add exactly one record: `CNAME`, host `www`, target `acda3b8dac47c744.vercel-dns-017.com.`.
4. Save that record as a separate operation; do not modify the apex A record, Google MX/TXT/DKIM records, Google verification CNAME, or `painel` CNAME.
5. Query public DNS until `www.primedigitalhub.com.br` resolves to the new target.
6. Test the homepage and the canonical ingestion route on `https://www.primedigitalhub.com.br`.

### B. Verify the production ingestion contract

1. Confirm that the official route is the canonical `/api/pipeline/ingest`, not the removed spreadsheet prototype.
2. Confirm the request schema, shared-secret check, idempotency key, transcript source metadata, and student identity fields.
3. Confirm that an accepted request returns a durable run identifier rather than performing long-running work inside the HTTP request.
4. Confirm that the route does not expose secrets in logs or responses.
5. Confirm that a malformed or unknown-student submission is quarantined and cannot publish to another student.

### C. Implement the Google-native trigger

1. Inspect Google Workspace Studio and create or repair a PRIME-specific Flow whose trigger watches Drive folder `1p7u86xfGCRkbSBiNgSZMnUNO5j4S5vMw`.
2. Restrict source triage to usable Google Docs Meet transcripts and ignore unrelated files.
3. Extract document ID, title, creation/update time, source URL, and transcript text or a supported document reference.
4. Submit the canonical payload to the official ingestion endpoint with the secret stored in the Flow’s protected configuration, never in a public document or prompt.
5. Ensure retry behavior is idempotent so the same Drive document cannot create duplicate runs.
6. Add an explicit error branch for HTTP failures, unsupported files, identity ambiguity, and endpoint timeouts.
7. Send a Google Chat or Gmail notification to Alexandre only after ingestion has been accepted, including the review URL and transcript identity.
8. Enable the Flow and capture its enabled state, trigger configuration, test-run result, and execution history.

### D. Complete the single consolidated Teacher Insight moment

1. Ensure one review package contains attendance suggestion, teacher attendance confirmation, teacher lesson note, AI class-report draft, source transcript reference, and student identity evidence.
2. Make teacher attendance authoritative; AI may suggest but may not publish attendance without teacher confirmation.
3. Give the teacher one Approve/Publish action and one Reject/Return-with-reason action.
4. Do not require a separate identity approval and publication approval for the same lesson.
5. Apply or verify the production `review_tasks` migration before relying on the queue.
6. Verify the notification links directly to the consolidated review package.

### E. Validate publication and isolation

1. Approve one controlled test lesson through the consolidated review UI.
2. Confirm the student dashboard receives only that student’s lesson, attendance, report, vocabulary, grammar, and feedback.
3. Confirm a different student cannot access the test lesson by URL, ID, or fallback behavior.
4. Confirm existing Rafael and Louise published profiles are not overwritten.
5. Confirm the published dashboard reflects the teacher’s note and attendance confirmation, with AI content subordinate to human decisions.
6. Capture timestamps, run ID, document ID, review task ID, notification evidence, deployment ID, and dashboard URL.

## 4. Definition of success

The automation is **implemented and validated** only when a newly generated Meet transcript placed in the PRIME Drive folder, with no operator API call or manual staging, produces a traceable ingestion run; the run creates one consolidated Teacher Insight review; Alexandre receives a notification; the teacher approves attendance and lesson note once; the approved lesson is published to exactly the intended student dashboard; and the evidence log contains the complete chain.

A READY Vercel deployment, a transcript existing in Drive, or a manually submitted API request alone does not satisfy this definition.

## 5. Honest final states

If the test succeeds, report the exact evidence chain and timestamps. If it fails, report the first failing event, the raw error category, whether the failure is deterministic, and the precise remaining dependency. Do not label the project end-to-end automated until the controlled test satisfies every success criterion above.

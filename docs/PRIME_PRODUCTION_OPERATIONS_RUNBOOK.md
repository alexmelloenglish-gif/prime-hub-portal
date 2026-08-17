# PRIME Digital Hub — Production Operations and Recovery Runbook

**Document status:** Operational baseline and acceptance contract  
**Version:** 1.0  
**Date:** 2026-08-17  
**Owner:** Alexandre Mello — `alexandre@primedigitalhub.com.br`  
**Product:** PRIME Digital Hub English-learning student dashboard  
**Repository:** `alexmelloenglish-gif/prime-hub-portal`  
**Production domain:** [www.primedigitalhub.com.br](https://www.primedigitalhub.com.br)

> This document is the copy-safe operating procedure for the PRIME Digital Hub. It exists to prevent the specific failures already experienced: stale Rafael-only fallbacks, cross-student data leakage, static Firebase-key dependence, partial WIF configuration, deployment drift, OAuth callback confusion, unsafe profile overwrites, and AI outputs becoming visible without human approval.

## 1. Non-negotiable operating rules

The dashboard is the student-facing product. Google Docs portfolios, Drive folders, raw Meet transcripts, Prompt 1 outputs, and intermediate JSON files are internal evidence or processing resources. They must not be treated as student-facing products by themselves.

The following rules are mandatory in every change, deployment, and recovery operation:

| Rule | Required behavior | Prohibited behavior |
|---|---|---|
| **Student isolation** | Resolve a student by stable `studentId` or an explicit verified email alias, then load only that student’s document. | Returning Rafael’s data when Louise, an unknown email, or a Firestore error is encountered. |
| **Authentication** | Use Vercel OIDC exchanged through Google Workload Identity Federation and a dedicated read-only service identity. | Creating, pasting, committing, or permanently storing a Firebase service-account private key. |
| **Fallback behavior** | Show a neutral repository-containment state or an explicit data-source error. | Silently presenting a real student’s content as a generic preview or masking a Firestore failure as success. |
| **AI authority** | Prompts produce proposals and drafts; authorized services and human review gates decide publication. | Allowing any prompt to mutate Firestore, Prisma projections, attendance, official reports, or student-visible state directly. |
| **Profile preservation** | Use stable IDs, version checks, backups, and field-level patches. | Replacing a whole student profile with an older JSON file or deleting history during synchronization. |
| **Deployment integrity** | Fetch and rebase before pushing; deploy only the intended repository and branch. | Force-pushing, overwriting newer remote work, or deploying the duplicate Vercel project. |
| **OAuth** | Keep only the official production callback authorized. | Adding temporary Vercel preview URLs to Google OAuth configuration. |
| **Secrets** | Keep secrets in Vercel/Google-managed secret storage and redact them from logs and documents. | Pasting tokens, private keys, passwords, cookies, or full secret values into chat, GitHub, or Markdown. |

The purpose of a fallback is containment, not to make the page look healthy. If authoritative data cannot be read, the product must make that distinction visible to the operator.

## 2. Canonical production identifiers

These identifiers are the approved baseline. Copy them exactly; do not substitute the duplicate Vercel project or an old Firebase project.

| Resource | Canonical value |
|---|---|
| Google Cloud / Firebase project | `prime-hub-portal` |
| Google Cloud project number | `567332591101` |
| Firestore database | `(default)` |
| Firestore collection | `students` |
| Louise document | `students/louise-nogueira-hotmail-com` |
| Rafael document | `students/rafael-copolillo-gmail-com` |
| Louise stable ID | `stu_c5930e6e76ae` |
| Rafael stable ID | `stu_cce1337c71da` |
| Human administrator | `alexandre@primedigitalhub.com.br` |
| Vercel team slug | `prime-digital-hun-dasboard` |
| Vercel production project | `prime-hub-portal` |
| Vercel production project ID | `prj_97TXOV8QcAMgFZUbbZ0MaSNjvSXX` |
| Official domain | `https://www.primedigitalhub.com.br` |
| GitHub repository | `alexmelloenglish-gif/prime-hub-portal` |
| Production branch | `main` |
| Meet/Drive recordings folder ID | `1p7u86xfGCRkbSBiNgSZMnUNO5j4S5vMw` |
| Dedicated WIF service account | `prime-dashboard-reader@prime-hub-portal.iam.gserviceaccount.com` |
| WIF pool | `vercel-prod` |
| WIF provider | `vercel` |
| Vercel OIDC issuer | `https://oidc.vercel.com/prime-digital-hun-dasboard` |

There is a second Vercel project named `alexmelloenglish-gif-prime-hub-portal`. It is not the production project and has no authority over the official custom domain. Never use it for production environment changes or validation.

## 3. Current state and remaining acceptance gaps

The WIF infrastructure was created successfully in Cloud Shell. The observed result was `WIF_CONFIGURED=true`, with provider state `ACTIVE`, the dedicated service account, `roles/datastore.viewer`, and a binding restricted to the exact Production Vercel subject.

The six non-secret `GCP_*` variables were saved in Vercel Production, and deployment `HFZebUL9DzkiVbs6GSsFpGFzYwkG` reached `Ready` from commit `759e2a2`. Live checks showed Rafael’s repository containment profile and Louise’s own repository containment profile without cross-student leakage. That proves the emergency containment patch is live; it does **not**, by itself, prove that a server-side Firestore read succeeded through WIF.

The production acceptance state must remain **yellow** until all rows below are green. In particular, the source badge must distinguish `firestore` from `repository`, and the admin directory must never return a Rafael-only fallback when Firestore is unavailable.

| Area | Known state | Acceptance requirement |
|---|---|---|
| WIF pool/provider | Created; provider observed `ACTIVE` | Provider issuer, audience, subject condition, and service-account binding must be re-verified. |
| Vercel WIF variables | Saved in Production | All six values must match Section 6 exactly. |
| Rafael isolation | Containment verified | Firestore success must show Rafael’s ten attendance records and correct historical data. |
| Louise isolation | Containment verified | Firestore success must show Louise’s own profile and six own management links, never Rafael’s lesson content. |
| Dashboard source label | Earlier UI mapped repository to “Preview mode” | Display an explicit source such as `Firestore`, `Repository containment`, or `Data unavailable`. |
| Admin directory | Existing code still contains a Rafael-only fallback | Replace fallback with a visible error/empty state; never return Rafael-only data on failure. |
| Static Firebase key | Legacy variable existed during migration | Remove `FIREBASE_PRIVATE_KEY` after WIF runtime success is proven. |
| Pipeline continuity | Architecture and contracts documented | Execute an idempotent transcript-to-review-to-publication test and record evidence. |

## 4. Authoritative data model

The source-of-truth boundary is intentionally explicit. A source may propose or hold evidence without having permission to publish it.

| Data | Authoritative source | Allowed writer | Student-facing effect |
|---|---|---|---|
| Student identity, stable ID, profile, and own links | Firestore `students/{documentId}` | Authorized profile service or teacher-approved admin action | Profile and management links |
| Raw Meet transcript | PostgreSQL `Transcript` | Ingestion service | Never official learning content by default |
| Evidence candidates | PostgreSQL `EvidenceCandidate` | Prompt 1 proposal service | None until accepted |
| Validated evidence | Review decision derived from candidates | Teacher/admin reviewer | Supports later projections |
| Learning signals | Approved `LearningSignalProposal` | Teacher/admin reviewer | Supports reports and projections |
| Teacher insight | Published `TeacherInsightProposal` | Teacher/admin reviewer | Teacher feedback and reports |
| Class report | `ClassReportProjection` | Prompt 2 draft plus publication gate | Published lesson report |
| Longitudinal progress | `PortfolioProjection` | Deterministic projection service | Progress, vocabulary, corrections, attendance |
| Coaching guidance | `CoachingGuidance` | Prompt 4 proposal plus teacher approval | Teacher-facing guidance only |
| Application code | GitHub plus successful Vercel deployment | Repository maintainers | Makes the software path available |

No raw Prompt 1 response, unreviewed Prompt 2 draft, proposed Prompt 3 patch, or Prompt 4 recommendation may be rendered as official student content.

## 5. Canonical continuous pipeline

The pipeline must run in this order and retain an auditable state for every lesson:

```text
Google Meet transcript / Drive artifact discovered
        ↓
Ingestion + normalized identity + idempotency check
        ↓
Raw Transcript persisted in PostgreSQL
        ↓
Prompt 1: evidence, signal, and insight proposals only
        ↓
Evidence review gate
        ↓
Learning-signal validation gate
        ↓
Teacher-insight review/publication gate
        ↓
Prompt 2: class-report draft from authorized inputs only
        ↓
Human class-report publication gate
        ↓
Deterministic portfolio projection service
        ↓
Prompt 3: idempotent patch contract, never direct mutation
        ↓
Patch approval and deterministic application
        ↓
Prompt 4: recommendation-only coaching guidance
        ↓
Human coaching/publication gate
        ↓
Prisma and Firestore projections become visible in the dashboard
```

The minimum workflow state machine is:

```text
RECEIVED → PROCESSING → PROPOSALS_READY → AWAITING_REVIEW
        → EVIDENCE_VALIDATED → REPORT_DRAFTED
        → REPORT_PUBLISHED → PROJECTION_APPLIED
        → COACHING_REVIEW → PUBLISHED
```

Failures and rejections must be explicit:

```text
PROCESSING → FAILED → RETRYABLE or BLOCKED
AWAITING_REVIEW → REJECTED → REVISION_REQUIRED
```

Every transition records the reviewer or service identity, timestamp, previous state, next state, reason, transcript ID, and pipeline-run ID. A dashboard must never infer “published” merely because a proposal exists.

## 6. Prompt 1–4 authority contract

The four locked prompts are components of one causal chain, not four independent writers.

| Prompt | Permitted output | Required inputs | Absolute prohibition |
|---|---|---|---|
| **Prompt 1 — Evidence and signal proposals** | Evidence candidates with transcript spans, confidence, learning-signal proposals, and teacher-insight proposals. | Raw transcript and normalized student identity. | No Firestore mutation, no official attendance decision, no official learning state, no publication. |
| **Prompt 2 — Class report projection draft** | Draft class report using only accepted evidence, validated signals, and published teacher references. | Authorized review outputs, not raw unreviewed guesses. | No invention of evidence, no teacher decision, no direct publication. |
| **Prompt 3 — Portfolio patch contract** | Structured, idempotent description of changes to the longitudinal projection. | Approved class report and authorized projection inputs. | No direct database write; only the deterministic projection service applies the patch. |
| **Prompt 4 — Coaching recommendation** | Recommendation-only guidance for the teacher, with rationale and evidence references. | Approved and published inputs only. | No autonomous pedagogical decision, no direct student-dashboard mutation, no hidden change of level or attendance. |

A valid review interface exposes evidence spans, source links, confidence, proposed output, and the exact action that will occur after approval. It must not offer a button that writes arbitrary JSON to Firestore.

## 7. Human publication gates

| Gate | Reviewer action | State after approval | Student visibility |
|---|---|---|---|
| Evidence | Accept or reject a candidate | Accepted/rejected evidence | No direct visibility |
| Learning signal | Validate or reject a signal | Validated/rejected signal | No direct visibility |
| Teacher insight | Publish or return for revision | Published/returned insight | Supports later reports |
| Class report | Publish or return for revision | Published report | Yes, as a lesson-report input |
| Portfolio patch | Approve or reject | Applied/rejected deterministic patch | Yes, after projection update |
| Coaching | Approve, reject, or revise | Published/returned guidance | Teacher-facing area only |

The same approval must be idempotent. Repeating a successful approval with the same stable lesson ID and patch ID must produce no duplicate report, lesson, attendance entry, vocabulary item, or projection operation.

## 8. Identity resolution and student-isolation contract

The stable identity is the `studentId`, not a display name and not a mutable URL spelling. The current canonical documents are `louise-nogueira-hotmail-com` and `rafael-copolillo-gmail-com`. Louise’s stored Firestore email is `louise_nogueira@hotmail.com`, while the public URL currently uses `louise.nogueira@hotmail.com`. Both forms must resolve to the same stable document through an explicit alias map or a verified identity lookup.

The lookup order must be:

1. Resolve a verified email alias to a stable `studentId` and canonical Firestore document ID.
2. Load the exact document by ID.
3. Confirm that the returned `studentId` and normalized identity match the requested student.
4. Only then render the profile.
5. If no match exists or Firestore fails, return a neutral data-unavailable state; never select another student.

The secondary email query must not be the only lookup mechanism because punctuation and underscore differences can cause a valid student to disappear. The data model should eventually store `canonicalEmail` plus an `emailAliases` array while preserving the stable ID and existing history.

The following assertions are mandatory tests:

```text
Request Rafael email → Rafael stable ID → Rafael document only.
Request Louise dot email → Louise stable ID → Louise document only.
Request Louise underscore email → same Louise stable ID → same document only.
Request unknown email → no student; never Rafael and never Louise.
Firestore unavailable for Louise → neutral error/containment state; never Rafael.
Firestore unavailable for Rafael → neutral error/containment state; never Louise.
```

## 9. WIF/OIDC production authentication

The production dashboard uses short-lived Vercel OIDC tokens exchanged through Google Workload Identity Federation. This is the approved replacement for the invalid static `FIREBASE_PRIVATE_KEY` path. Vercel describes OIDC federation as a way to obtain short-lived, non-persistent credentials, and Google documents Workload Identity Federation as the mechanism for external workloads to access Google Cloud without long-lived service-account keys.[1] [2]

### 9.1 Required GCP resources

| Resource | Required value |
|---|---|
| Pool | `vercel-prod` in location `global` |
| Provider | `vercel` |
| Issuer | `https://oidc.vercel.com/prime-digital-hun-dasboard` |
| Audience | `https://iam.googleapis.com/projects/567332591101/locations/global/workloadIdentityPools/vercel-prod/providers/vercel` |
| Service account | `prime-dashboard-reader@prime-hub-portal.iam.gserviceaccount.com` |
| Firestore permission | `roles/datastore.viewer` |
| Federated permission | `roles/iam.workloadIdentityUser` |
| Exact Vercel subject | `owner:prime-digital-hun-dasboard:project:prime-hub-portal:environment:production` |

The provider must map `google.subject=assertion.sub`, allow only the verified audience, and enforce the exact Production subject. If the current provider was created without the attribute condition, update it before declaring the configuration fully hardened.

### 9.2 Copy-safe Cloud Shell verification

Open Cloud Shell in project `prime-hub-portal` and run only read-only verification first:

```bash
gcloud config set project prime-hub-portal --quiet

gcloud iam workload-identity-pools describe vercel-prod \
  --project=prime-hub-portal \
  --location=global

gcloud iam workload-identity-pools providers describe vercel \
  --project=prime-hub-portal \
  --location=global \
  --workload-identity-pool=vercel-prod \
  --format='yaml(name,state,attributeMapping,attributeCondition,oidc)'
gcloud iam service-accounts get-iam-policy \
  prime-dashboard-reader@prime-hub-portal.iam.gserviceaccount.com \
  --project=prime-hub-portal \
  --format='yaml(bindings)'
```

The output must show the active provider, the correct issuer, the correct audience, the subject mapping, the exact Production subject condition, `roles/datastore.viewer` on the dedicated service account, and only the exact Production federated subject in the impersonation binding. Never paste a private key or access token into the terminal transcript, chat, GitHub, or this runbook.

If the provider lacks the exact subject condition, use the approved Google Cloud command form below after reviewing the current provider configuration:

```bash
export PROJECT_ID='prime-hub-portal'
export PROJECT_NUMBER='567332591101'
export POOL_ID='vercel-prod'
export PROVIDER_ID='vercel'
export ISSUER='https://oidc.vercel.com/prime-digital-hun-dasboard'
export VERCEL_SUBJECT='owner:prime-digital-hun-dasboard:project:prime-hub-portal:environment:production'
export AUDIENCE="https://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}"

gcloud iam workload-identity-pools providers update-oidc "${PROVIDER_ID}" \
  --project="${PROJECT_ID}" \
  --location=global \
  --workload-identity-pool="${POOL_ID}" \
  --issuer-uri="${ISSUER}" \
  --attribute-mapping='google.subject=assertion.sub' \
  --attribute-condition="assertion.sub == '${VERCEL_SUBJECT}'" \
  --allowed-audiences="${AUDIENCE}"
```

Do not recreate an existing pool or provider merely because a command was pasted into `less`. Press `q`, return to the Cloud Shell prompt, inspect the state, and then run one command block. If a command is interrupted, do not assume partial success; verify each resource explicitly.

### 9.3 Vercel Production variables

The six non-secret values below must exist in the official project, with **Production only** scope:

| Variable | Value |
|---|---|
| `GCP_PROJECT_ID` | `prime-hub-portal` |
| `GCP_PROJECT_NUMBER` | `567332591101` |
| `GCP_SERVICE_ACCOUNT_EMAIL` | `prime-dashboard-reader@prime-hub-portal.iam.gserviceaccount.com` |
| `GCP_WORKLOAD_IDENTITY_POOL_ID` | `vercel-prod` |
| `GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID` | `vercel` |
| `GCP_AUDIENCE` | `https://iam.googleapis.com/projects/567332591101/locations/global/workloadIdentityPools/vercel-prod/providers/vercel` |

The application obtains the short-lived Vercel token at runtime. Do not create a manual `VERCEL_OIDC_TOKEN` variable. Keep `FIREBASE_PROJECT_ID=prime-hub-portal` and `FIREBASE_STUDENT_COLLECTION=students`. After WIF is proven in Production, remove the legacy `FIREBASE_PRIVATE_KEY` and any legacy static-key fallback variables. The organization policy blocking service-account key creation must remain enforced.

### 9.4 Runtime acceptance evidence

The safe diagnostic must report identifiers and booleans only. The expected state is equivalent to:

```text
federatedAuthConfigured: true
authMode: vercel-oidc-wif
projectId: prime-hub-portal
collection: students
privateKeyPresent: false or legacy-only-and-disabled
```

The diagnostic must never log tokens, private-key contents, full environment values, transcript contents, or student records. A successful diagnostic alone is insufficient; the server must also complete a Firestore read of the intended collection and pass the two-student isolation tests.

## 10. Repository and Vercel deployment procedure

The GitHub repository is the source for application code. Firestore and PostgreSQL hold runtime data and projections. A lesson must not require a code commit to become visible after an authorized publication decision.

Before changing code, synchronize safely:

```bash
cd /home/ubuntu/prime-hub-portal
git fetch origin
git status --short
git log --oneline --decorate -8
npm ci
npm run build
```

If the remote branch is newer, do not force-push. Rebase local work on the current remote branch:

```bash
git pull --rebase origin main
npm ci
npm run build
```

Resolve conflicts by preserving newer remote work and the intended containment patch. Then review the exact diff:

```bash
git diff --check
git diff -- app/dashboard/page.tsx lib/student-data.ts lib/admin-dashboard.ts lib/firebase-admin.ts
```

Commit only the intended files and push normally:

```bash
git add app/dashboard/page.tsx lib/student-data.ts lib/admin-dashboard.ts lib/firebase-admin.ts docs/PRIME_PRODUCTION_OPERATIONS_RUNBOOK.md
 git commit -m 'fix: harden student isolation and production data-source handling'
git push origin main
```

Never use `git push --force` for this project. If a verified-commit protection rule rejects the push, treat that as a repository-governance decision. Configure signed/verified commits or obtain an explicit maintainer decision; do not bypass the protection casually.

The Vercel project must be the official `prime-hub-portal` project, linked to `main`, and assigned to `www.primedigitalhub.com.br`. After environment-variable changes, create a new Production deployment and wait for `Ready`. Node.js 24.x should be selected before 2026-10-01 because Vercel has announced that new builds using Node.js 20.x will fail after that date.

## 11. Required code behavior before Production is green

The following implementation checks are mandatory:

| File or area | Required behavior |
|---|---|
| `lib/firebase-admin.ts` | Prefer WIF whenever all `GCP_*` values are present; expose only safe status; keep static-key code only as temporary migration fallback. |
| `lib/student-data.ts` | Repository fallback is student-specific and neutral; absent data never imports Rafael fixtures into Louise; source mode is explicit. |
| `lib/admin-dashboard.ts` | Firestore failure must produce a visible error or empty state; the `fallbackStudents` Rafael-only array must not be returned as if it were a real directory. |
| `app/dashboard/page.tsx` | Display `Firestore`, `Repository containment`, or `Data unavailable` distinctly; never label repository data as generic “Preview mode” when it is a real containment profile. |
| `data/students/*.firestore.json` | Preserve stable IDs, historical attendance, canonical links, and student-specific content. |
| Review and publication endpoints | Require authenticated reviewer identity, explicit state transition, idempotency key, and audit record. |

A safe repository containment profile is allowed during an outage, but it must be clearly labeled and must not masquerade as a successful Firestore read. The admin directory is especially important: a one-student fallback is not an acceptable outage experience because it creates false evidence that only one student exists.

## 12. Safe Firestore profile publication and preservation

Routine lesson updates must go through the pipeline and approved projection service. Manual Cloud Shell publication is an emergency recovery procedure only.

Before any manual profile update:

1. Confirm the active project is exactly `prime-hub-portal`.
2. Confirm the target document ID and stable `studentId`.
3. Export or read the current document without exposing secrets.
4. Produce a field-level diff between the current document and the candidate JSON.
5. Confirm that historical attendance, stable IDs, and management links are preserved.
6. Obtain teacher approval for the exact change.
7. Apply a transaction or version-checked patch, not an unconditional whole-document replacement.
8. Re-read the target document and validate the dashboard URL.

The existing Cloud Shell utility is safe for the two-profile recovery publication when the operator has reviewed the canonical JSON and intentionally accepts the upsert behavior:

```bash
gcloud config set project prime-hub-portal --quiet
gcloud auth list
git clone --depth 1 https://github.com/alexmelloenglish-gif/prime-hub-portal.git /tmp/prime-hub-portal
cd /tmp/prime-hub-portal
node scripts/upsert-students-gcloud.mjs
```

Its output must identify only the intended documents:

```text
Upserted louise-nogueira-hotmail-com ...
Upserted rafael-copolillo-gmail-com ...
Firestore profile publication completed.
```

Do not run this utility as an automatic reaction to a dashboard error, and do not use an older JSON file simply because it is available in a local folder. For normal operation, implement a field-level, versioned profile service so existing Firestore data cannot be silently overwritten.

## 13. OAuth and browser-session rules

The only authorized Google OAuth callback for the production product is:

```text
https://www.primedigitalhub.com.br/api/auth/callback/google
```

A `redirect_uri_mismatch` involving a temporary Vercel hostname does not justify adding that preview URL to Google OAuth. Preview deployments should be tested with a controlled non-production authentication strategy or without changing the production OAuth allowlist.

A browser session is not an automation credential. The owner must maintain 2-Step Verification, at least two independent recovery factors, offline backup codes, and a second trusted administrator. Vercel, Google Cloud, Firebase, GitHub, and Google Workspace access must be recoverable without sharing a password or depending on one open browser tab.

A Vercel personal token was exposed during the incident. The owner must revoke it from the Vercel account and replace any related access through the normal authenticated interface. No token value belongs in this runbook.

## 14. Failure diagnosis matrix

| Symptom | Most likely cause | Correct response |
|---|---|---|
| `16 UNAUTHENTICATED` | Invalid legacy key, wrong audience, wrong provider, or token exchange failure | Inspect WIF issuer, audience, subject condition, project number, and runtime `authMode`; do not create a key first. |
| `PERMISSION_DENIED` | Missing `roles/datastore.viewer` or incorrect service-account binding | Inspect the dedicated service-account IAM policy and project role. |
| `federatedAuthConfigured: false` | One or more `GCP_*` variables missing, misspelled, or scoped outside Production | Compare all six variables with Section 9.3 and redeploy. |
| Dashboard says Preview mode | Source-label collapse or actual repository fallback | Inspect explicit source mode and safe diagnostic; never infer Firestore success from the page loading. |
| Louise displays Rafael | Cross-student fallback or incorrect alias resolution | Stop publication, fix lookup/fallback, test unknown email, and revalidate both students. |
| Admin directory shows only Rafael | `fallbackStudents` returned after Firestore failure or zero-doc result | Replace with visible error/empty state and verify Firestore collection count. |
| `redirect_uri_mismatch` on preview URL | Temporary hostname is not in OAuth allowlist | Do not add preview callback; use official domain callback only. |
| Git push rejected as non-fast-forward | Remote branch has newer commits | `git fetch`, inspect, `git pull --rebase`, build, review, then push. Never force-push. |
| Cloud Shell shows `less` help or `Pattern not found` | Command was pasted into a pager | Press `q`, return to the prompt, verify state, and rerun a clean command block. |
| WIF resource already exists | Previous command completed before the terminal was interrupted | Describe and verify the resource; do not recreate it. |
| Vercel build warns about Node 20.x | Maintenance deadline before 2026-10-01 | Change the project runtime to Node 24.x and redeploy; this is separate from Firestore auth. |

## 15. Production validation protocol

A deployment is not accepted merely because Vercel reports `Ready`. The following checks must be executed against the official domain after every authentication, data-loader, or deployment change:

| Test | Expected result |
|---|---|
| `/dashboard/admin` | Both Louise and Rafael appear from Firestore; no Rafael-only fallback. |
| Rafael URL | `studentId=stu_cce1337c71da`, ten attendance records, Rafael links and history. |
| Louise dot-email URL | `studentId=stu_c5930e6e76ae`, Louise profile, own links, no Rafael lessons. |
| Louise underscore-email lookup | Same Louise document and stable ID as the dot-email alias. |
| Unknown email | Neutral not-found or data-unavailable state; no student substituted. |
| Firestore outage simulation | Visible data-unavailable state; no cross-student fallback and no false “Firestore” source label. |
| Runtime diagnostic | `federatedAuthConfigured=true`, `authMode=vercel-oidc-wif`, correct project and collection. |
| Pipeline idempotency | Reprocessing one transcript creates no duplicate lesson, report, attendance, or patch. |
| Human gate | Unapproved Prompt 1–4 output is not student-visible. |

The evidence record for each production validation must contain the deployment ID, source commit, timestamp, runtime auth mode, transcript ID if relevant, pipeline run ID, review decision IDs, projection version, and the exact dashboard URLs tested. It must not contain secret values or raw access tokens.

## 16. End-to-end transcript acceptance test

Use one real or controlled Meet transcript from the configured Drive folder. The test must demonstrate the entire causal chain:

1. The scanner finds the Drive artifact and records its external ID.
2. Ingestion creates exactly one `Transcript` row.
3. Prompt 1 creates proposal records with supporting transcript spans and no publication side effects.
4. The teacher accepts or rejects evidence and learning signals in the review queue.
5. Prompt 2 creates a class-report draft using only authorized records.
6. The teacher publishes or rejects the class report.
7. The deterministic projection service creates a versioned portfolio patch.
8. Prompt 3 describes the patch but does not apply it directly.
9. The teacher approves the patch and the service applies it idempotently.
10. Prompt 4 creates recommendation-only coaching guidance from approved inputs.
11. The teacher approves or rejects coaching guidance.
12. PostgreSQL and Firestore projections update, and the dashboard shows only the approved result.
13. Re-running the scanner and repeating the approved action produces no duplicates.

The dashboard must be the final verification surface. A portfolio document may be checked as an internal evidence resource, but its existence is not proof that the student product was correctly published.

## 17. Durable access and recovery

The owner should enable 2-Step Verification, register two independent second factors, verify a recovery phone and email, store backup codes offline, and add a second trusted administrator. Review IAM membership quarterly and after every administrator or credential change.

The organization constraint `constraints/iam.disableServiceAccountKeyCreation` must remain enforced. If an emergency exception is ever considered, it requires an explicit security decision, a short-lived documented purpose, private secret handling, immediate restoration of the restriction, a recorded key ID rather than the key material, and a scheduled revocation. The preferred and final architecture remains WIF with no user-managed key.

The recovery sequence is:

1. Recover a trusted human Google account.
2. Confirm project `prime-hub-portal` and organization `5531779573`.
3. Verify WIF pool, provider, service account, roles, and subject binding.
4. Verify Vercel project and Production variables without opening secrets.
5. Fetch the GitHub repository and build from `main`.
6. Verify Firestore documents by stable ID.
7. Run the dashboard isolation tests.
8. Run the transcript idempotency test.
9. Record the incident, changes, evidence, and follow-up actions.

## 18. Definition of done

The system is **green** only when all of the following are true:

1. The official domain is served by the intended Vercel project and a successful deployment from the current `main` branch.
2. The runtime uses `vercel-oidc-wif` and successfully reads Firestore `students`.
3. Rafael’s dashboard preserves his historical data, including ten attendance records.
4. Louise’s dashboard resolves to her stable ID, own profile, own links, and own lesson data.
5. An unknown email cannot receive another student’s data.
6. The admin directory shows both students from Firestore or an explicit error state; it never returns a Rafael-only fallback.
7. `FIREBASE_PRIVATE_KEY` is removed from Production after WIF validation.
8. Prompt 1 remains non-authoritative and Prompts 2–4 cannot bypass human publication gates.
9. A new transcript is ingested once, reviewed, approved, projected, and displayed without a GitHub commit.
10. Reprocessing is idempotent and auditable.
11. OAuth authorizes only the official production callback.
12. Recovery can be performed by the owner or second trusted administrator without a browser cookie, shared password, or static service-account key.

Until these conditions are met, the correct status is **contained but not fully accepted**, not “implemented” or “production complete.”

## 19. References

[1]: https://vercel.com/docs/oidc/gcp "Vercel — Connect to Google Cloud Platform with OIDC"

[2]: https://docs.cloud.google.com/iam/docs/workload-identity-federation "Google Cloud — Workload Identity Federation"

[3]: https://docs.cloud.google.com/iam/docs/service-account-impersonation "Google Cloud — Service account impersonation"

[4]: https://firebase.google.com/docs/firestore/security/iam "Firebase — Firestore IAM"

[5]: https://developers.google.com/workspace/meet/api/guides/overview "Google Meet REST API overview"

[6]: https://developers.google.com/workspace/drive/api/guides/push "Google Drive API — Notifications for resource changes"

[7]: https://developers.google.com/workspace/meet/api/reference/rest/v2/conferenceRecords.transcripts.entries/get "Google Meet API — transcript entries"

[8]: https://docs.cloud.google.com/resource-manager/docs/secure-by-default-organizations "Google Cloud — Secure-by-default organizations and service-account key restrictions"

[9]: https://github.com/alexmelloenglish-gif/prime-hub-portal/blob/main/docs/continuous-pipeline-architecture.md "PRIME repository — Continuous transcript-to-dashboard architecture"

[10]: https://github.com/alexmelloenglish-gif/prime-hub-portal/blob/main/docs/access-recovery.md "PRIME repository — Durable access and recovery runbook"

[11]: https://github.com/alexmelloenglish-gif/prime-hub-portal/blob/main/docs/vercel-gcp-wif-setup.md "PRIME repository — Vercel GCP WIF setup"

[12]: https://github.com/alexmelloenglish-gif/prime-hub-portal/blob/main/docs/production-dashboard-diagnosis-2026-08-17.md "PRIME repository — Production dashboard diagnosis"

---

**Operational instruction:** When in doubt, stop the publication, preserve the current data, inspect the authoritative source, and record the decision. A visible failure is safer than a successful-looking dashboard showing the wrong student.

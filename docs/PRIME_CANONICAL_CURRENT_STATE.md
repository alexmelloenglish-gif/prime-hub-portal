# 🚨 DO NOT RE-INVESTIGATE — PRIME DIGITAL HUB

## CANONICAL CURRENT STATE — OPERATIONAL SNAPSHOT

> **STOP. READ THIS FIRST.** This document is the canonical return point. Facts marked **PROVEN / DONE / LOCKED** must **NOT be re-investigated or rebuilt** unless new contradictory runtime evidence is produced.

**Anti-rework rule:** Before starting any investigation, read `docs/DO_NOT_REINVESTIGATE.md` and this document. Reopening a closed investigation without new evidence is considered retrabalho.

**Date:** 2026-08-31  
**Status:** CANONICAL / FROZEN CURRENT STOP POINT  
**Repository:** `alexmelloenglish-gif/prime-hub-portal`  
**Canonical branch:** `main`

---

# 0. 🚨 DO NOT RE-INVESTIGATE — PROVEN FACTS

The following are already established for this checkpoint:

```text
NEON SCHEMA FORENSIC AUDIT         = DONE
SIX HISTORICAL RUN AUDIT           = DONE
LAURA HISTORICAL RECORD AUDIT      = DONE
IDEMPOTENCY STRUCTURAL AUDIT       = DONE
RETRY IMPLEMENTATION               = DONE / DEPLOYED
APPS SCRIPT PROJECT IDENTIFICATION = DONE
DRIVE → PORTAL TRANSPORT           = PROVEN
TRANSCRIPT PERSISTENCE             = PROVEN
PIPELINERUN CREATION               = PROVEN
PROMPT 1 REACHED                   = PROVEN
PORTAL → GEMINI CALL LOCALIZATION  = PROVEN
```

**Do not redo these audits merely because a new agent/session starts.** Only reopen one when there is new evidence of regression, contradiction, or a changed requirement.

### Current blocker — do not confuse it with the closed investigations

```text
CURRENT ROOT BLOCKER = GOOGLE CLOUD BILLING / GEMINI PROVIDER ACCESS
GEMINI HEALTHCHECK   = HTTP 403 / PERMISSION_DENIED
BILLING SETUP        = OR_BACR2_59 / BLOCKED
```

The historical Apps Script → Prompt 1 causality remains:

```text
PROMPT_1_403_CAUSED_BY_APPS_SCRIPT = NOT_PROVEN
```

---

# 1. Existing product/runtime and Teacher Intelligence

The product/runtime foundation remains:

```text
Drive
→ ingestion
→ transcript
→ pipeline
→ projections
→ dashboard
```

Teacher Intelligence observability surfaces remain implemented as previously recorded, including PipelineRun, PipelineEvent, transcript/provenance inspection, Evidence Candidate review, Learning Signal Proposal, Teacher Insight Proposal, Class Report/Portfolio inspection, audit/provenance and existing Pipeline ReviewTask workflow.

These surfaces do not manufacture cognitive lifecycle state.

---

# 2. Retry implementation — FROZEN

The targeted retry mechanism is already implemented and deployed to Production.

- Production deployment: `dpl_51Jfb5ZfhcuhffrWB5R2G4gNzF6c`
- Audited GitHub SHA: `43eda9442732887089a85d23111baa320ab04ca1`
- Endpoint: `POST /api/admin/pipeline/retry`
- Path: `retryFailedPipelineRun()` → `processLessonTranscript()`

**Do not implement, refactor, migrate, or modify the retry mechanism during the current investigation.**

Laura retry has not been executed.

---

# 3. Neon historical evidence — LOCKED

The Neon forensic audit established that the six historical PipelineRuns are intact and remain `failed`.

All six have:

```text
Transcript persisted
PipelineRun persisted
Prompt 1 reached
GeminiGenerationFailed
provider = gemini
stage = prompt-1
httpStatus = 403
PipelineRun = failed
no downstream artifacts
```

Laura's canonical historical record remains intact:

```text
PipelineRun = cmtcqbiy800006cqasv3nsziu
Transcript  = cmtcqbiyy00026cqafg8r788w
Lesson      = lesson_a3368991e6ba0c79
Status      = failed
Error       = GEMINI_HTTP_ERROR / HTTP 403
```

The retry can structurally reuse the historical Transcript and Lesson without schema migration, using a new PipelineRun identity, new idempotency key and unused attempt number.

The historical database audit is complete for this checkpoint and should not be repeated without new evidence.

---

# 4. Causality separation — LOCKED

The following remain independent findings unless runtime evidence proves a causal relationship:

- Firebase `UNAUTHENTICATED`
- Drive `ingest_http_500`
- historical Drive `403`
- historical `invalid_grant`
- historical Gemini HTTP 403
- retry/idempotency behavior
- Apps Script runtime/trigger errors
- Cloud Billing / Payments restriction

The Apps Script has not been proven to cause the historical Gemini 403.

---

# 5. Apps Script — current recorded state

Primary candidate:

- Project: `PRIME Digital Hub — Google Meet Transcript Automation`
- Script ID: `1ZCiOyQPRQocSMbAER9c0FelY494I5TTLP639XWdrzmNrSqzbekNIByB5`
- Owner: `alexandre@primedigitalhub.com.br`

The prior forensic audit could identify the project but could not read its manifest, source, triggers or execution history because of access/scope limitations.

Therefore:

```text
PROMPT_1_403_CAUSED_BY_APPS_SCRIPT = NOT_PROVEN
```

Do not infer runtime or trigger behavior without actual Apps Script evidence.

---

# 6. Portal → Gemini localization

The audited Production source establishes the portal-side architecture:

```text
/api/pipeline/ingest
→ processLessonTranscript()
→ runPromptOne()
→ Gemini generation layer
→ generateContent
```

The Gemini call is performed in the portal runtime rather than directly by the ingestion route.

Relevant runtime configuration includes:

```text
GOOGLE_AI_STUDIO_API_KEY
PRIME_PIPELINE_MODEL
```

This source evidence localizes the historical Prompt 1 403 to the portal-to-provider call, while preserving the Apps Script causality status as `NOT_PROVEN`.

---

# 7. NEW CURRENT BLOCKER — CLOUD BILLING / GEMINI ACCESS

A separate audited report has now established the current operational blocker as a Google Cloud Billing / Gemini access issue.

The isolated Gemini healthcheck was reported to reach the provider and return:

```text
HTTP 403
PERMISSION_DENIED
Your project has been denied access. Please contact support.
```

The same audit reported a Cloud Billing setup failure:

```text
OR_BACR2_59
Unable to complete billing setup.
Unable to configure your account.
```

The report further states that the previously available billing account is closed and that there is currently no active billing account available for the project.

For operational purposes, this snapshot therefore records:

```text
GOOGLE_CLOUD_BILLING = BLOCKED
BILLING_SETUP = FAILED / OR_BACR2_59
ACTIVE_BILLING_ACCOUNT_FOR_PROJECT = NO
GEMINI_PROVIDER_ACCESS = FAIL
CURRENT_GEMINI_RESULT = 403 PERMISSION_DENIED
```

### Public-repository security rule

This repository is public. Do not store payment-card information, full financial identifiers, API keys, tokens, passwords, CVV, or other secrets in GitHub documentation. Detailed billing evidence must remain in the private Google Cloud/Payments environment.

---

# 8. CURRENT EXECUTION GATE — SUPERSEDING PRIOR GL-003 ORDER

Any earlier section of this file that described immediate GL-003 execution is superseded by this current gate.

The order is now:

```text
CLOUD BILLING / PAYMENTS
        ↓
ACTIVE BILLING ACCOUNT
        ↓
PROJECT LINKED TO BILLING
        ↓
GEMINI ACCESS ALLOWED
        ↓
MINIMAL GEMINI HEALTHCHECK = PASS
        ↓
REMAINING RETRY PRE-FLIGHT = PASS
        ↓
GL-003 SAFE TO EXECUTE = YES
        ↓
ONE CONTROLLED LAURA RETRY
```

Until the minimal Gemini healthcheck passes:

```text
LAURA RETRY = BLOCKED
GL-003 = BLOCKED
FULL PIPELINE = BLOCKED
```

No code refactor, schema change, Apps Script change or repeated billing-account creation is authorized merely to bypass this gate.

---

# 9. Transport/persistence checkpoint — PROVEN

The current `/api/pipeline/ingest` route does not provide a natural stop point before Gemini. Its effective sequence is:

```text
Drive / external automation
        ↓
POST /api/pipeline/ingest
        ↓
Transcript persisted
        ↓
PipelineRun created
        ↓
status = processing
        ↓
processLessonTranscript()
        ↓
runPromptOne()
        ↓
Gemini generateContent
```

Historical production executions already provide the evidence needed for this breakpoint.

```text
DRIVE SOURCE DISCOVERY              = PROVEN
TRANSCRIPT READ / PAYLOAD CREATION  = PROVEN
APPS SCRIPT → CANONICAL ENDPOINT    = PROVEN
HTTP INGESTION                      = PROVEN
TRANSCRIPT PERSISTENCE              = PROVEN
PIPELINERUN CREATION                = PROVEN
PROMPT 1 INVOCATION REACHED         = PROVEN
GEMINI GENERATION                   = BLOCKED
GEMINI PROVIDER RESPONSE            = HTTP 403 PERMISSION_DENIED
DOWNSTREAM COGNITIVE ARTIFACTS      = BLOCKED
```

A fresh transcript is therefore **not** required merely to prove transport/persistence while Gemini remains blocked.

---

# 10. What is already DONE / what must NOT be redone

```text
NEON SCHEMA FORENSIC AUDIT        = DONE
SIX HISTORICAL RUN AUDIT          = DONE
LAURA HISTORICAL RECORD AUDIT     = DONE
IDEMPOTENCY STRUCTURAL AUDIT      = DONE
RETRY IMPLEMENTATION              = DONE / DEPLOYED
APPS SCRIPT PROJECT IDENTIFICATION= DONE
PORTAL GEMINI CALL LOCALIZATION   = DONE
DRIVE → PORTAL TRANSPORT           = PROVEN
TRANSCRIPT PERSISTENCE             = PROVEN
PIPELINERUN CREATION               = PROVEN
PROMPT 1 REACHED                   = PROVEN
```

Do not repeat these investigations without new contradictory evidence.

---

# 11. Future-agent reading order

Any new agent, Codex session or operator continuing this work must read:

1. `docs/DO_NOT_REINVESTIGATE.md` — **first: anti-rework guardrail**.
2. `docs/PRIME_CANONICAL_CURRENT_STATE.md` — canonical current state.
3. `docs/PRIME_FORENSIC_SNAPSHOT_2026-08-31.md` — cross-layer forensic checkpoint.
4. `docs/snapshot-apps-script-prompt1-gemini-2026-08-31.md` — Apps Script / Prompt 1 evidence.
5. `docs/google-drive-transcript-automation.md` — Drive/transcript architecture.
6. `app/api/pipeline/ingest/route.ts` — ingestion boundary.
7. `lib/pipeline/run.ts` — orchestration/failure persistence.
8. `lib/pipeline/prompts.ts` — Gemini provider call.
9. Neon `pipeline_runs`, `transcripts`, `pipeline_events` — historical persistence evidence.

Use audited Production SHA `43eda9442732887089a85d23111baa320ab04ca1` when reproducing the source-level reasoning recorded here, unless a newer verified deployment is explicitly recorded.

---

# 12. Security and credential handling

If Vercel access is requested, authenticate through the account that owns/has access to the Vercel project/workspace. GitHub credentials and Vercel login credentials are separate systems.

Never place passwords, 2FA codes, API tokens, private keys or production secrets in this repository or in chat.

Provider credentials used by the application are runtime configuration, not human login credentials.

---

# 13. CURRENT STOP POINT

```text
IMPLEMENTATION = FROZEN
HISTORICAL EVIDENCE = PRESERVED
RETRY = IMPLEMENTED BUT NOT EXECUTED
APPS SCRIPT CAUSALITY = NOT_PROVEN
PROMPT 1 HISTORICAL 403 = CONFIRMED
CURRENT GEMINI HEALTH = 403 / PERMISSION_DENIED
CLOUD BILLING = BLOCKED
GL-003 = BLOCKED
LAURA = BLOCKED
```

**CURRENT ROOT BLOCKER:** Google Cloud Billing / Gemini provider access.

**NEXT AUTHORIZED ACTION:** resolve the Billing/Payments restriction, confirm an active billing account usable by `prime-hub-portal`, then run only the minimal Gemini healthcheck. Do not execute Laura retry or GL-003 before that gate passes.

**STATUS: 🚨 DO NOT RE-INVESTIGATE — LOCKED FOR CONTINUATION — 2026-08-31**

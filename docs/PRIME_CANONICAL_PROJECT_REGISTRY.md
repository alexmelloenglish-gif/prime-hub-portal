# 🚨 PRIME DIGITAL HUB — CANONICAL PROJECT REGISTRY

**Status:** CANONICAL / OPERATIONAL IDENTITY MAP  
**Last updated:** 2026-08-31  
**Purpose:** prevent work on the wrong repository, project, environment, account, endpoint, deployment, billing profile, database or legacy version.

> **🚨 DO NOT RE-INVESTIGATE:** this registry is an identity map, not a redesign document. Verify only what is marked UNKNOWN/PENDING or what has new contradictory evidence.
>
> **🚨 DO NOT REPEAT FAILED PATHS WITHOUT NEW EVIDENCE.** A proven fact remains locked unless there is regression evidence, a code/runtime change, a contradiction, or a changed requirement.

## CORE RULE

If a repository, project, account, URL, environment, deployment or external service is not listed here as **CANONICAL / ACTIVE / VERIFIED**, do not assume it belongs to PRIME production. Verify first.

## SECURITY RULE

This public document may contain public identifiers, project IDs, account names, non-secret emails, URLs, environment-variable **names**, and status information. It must never contain passwords, API keys, private keys, `PIPELINE_SECRET` values, CVV, full card numbers, 2FA/recovery codes, session cookies, tokens or student transcript content.

## STATUS VOCABULARY

- **CANONICAL** — authoritative current resource
- **ACTIVE** — currently used operationally
- **VERIFIED** — confirmed by direct source/tool evidence
- **LEGACY** — historical; preserve for reference but do not use operationally
- **DEPRECATED** — intentionally retired
- **BLOCKED** — correct resource but currently unable to proceed
- **UNKNOWN** — discovered but ownership/purpose is not yet proven
- **DO NOT USE** — explicitly excluded from PRIME production
- **PROVEN / LOCKED** — behavior or fact established by evidence; do not reopen without a defined reopening condition

---

# 1. GITHUB

**Repository:** `alexmelloenglish-gif/prime-hub-portal`  
**URL:** https://github.com/alexmelloenglish-gif/prime-hub-portal  
**Default branch:** `main`  
**Repository ID:** `1217594556`  
**Status:** **CANONICAL / ACTIVE / VERIFIED**  
**Purpose:** PRIME Digital Hub portal, pipeline, Teacher Intelligence, production documentation and runtime code.

### Canonical documentation anchors

1. `docs/DO_NOT_REINVESTIGATE.md` — anti-rework guardrail; **read first**.
2. `docs/PRIME_CANONICAL_PROJECT_REGISTRY.md` — operational identity map; **read second**.
3. `docs/PRIME_CANONICAL_CURRENT_STATE.md` — canonical current state.
4. `docs/PRIME_FORENSIC_SNAPSHOT_2026-08-31.md` — cross-layer forensic checkpoint.
5. `docs/snapshot-apps-script-prompt1-gemini-2026-08-31.md` — Apps Script / Prompt 1 evidence.

### Known external lookalikes — DO NOT USE

- `Eladtz2025/prime-property-hub-portal` — external / DO NOT USE.
- `NovaARStack/prime-hub-services` — external / DO NOT USE.
- `VeltrixaLabs/prime-hub-lab` — external / DO NOT USE.
- `Kvantixflow/pipeline-hub` — external / DO NOT USE.
- Other similarly named public repositories — **UNKNOWN / EXTERNAL until proven otherwise**.

**GitHub operator identity:** `alexmelloenglish-gif` — VERIFIED for canonical repository control.

---

# 2. VERCEL

**Project:** `prime-hub-portal`  
**Project ID:** `prj_97TXOV8QcAMgFZUbbZ0MaSNjvSXX`  
**Team slug:** `prime-digital-hun-dasboard`  
**Team ID:** `team_IzmZVUw0i508RwviU26at2Or`  
**Status:** **CANONICAL / ACTIVE** — previously audited identifiers.

**Production role:** hosts the PRIME portal and pipeline runtime, including `/api/pipeline/ingest` and the admin Gemini healthcheck.

### Environment-variable names known to matter

- `GOOGLE_AI_STUDIO_API_KEY` — secret value is never stored here.
- `PRIME_PIPELINE_MODEL` — configuration name only.
- `PIPELINE_SECRET` — secret value is never stored here.

### Login / credential distinction

**GitHub login and Vercel login are separate systems.** If a person is asked to log into Vercel, they must authenticate using the identity/account that actually has access to the canonical Vercel team/project. A GitHub username is not itself a Vercel password or credential. Do not place either login credential in this registry.

### Pending direct verification

- Exact authoritative Production domain/deployment mapping at the current moment.
- Current Production deployment SHA mapping after each approved deployment.

---

# 3. GOOGLE CLOUD / GEMINI

**Canonical Google Cloud project:** `prime-hub-portal`  
**Status:** **CANONICAL / BLOCKED**  
**Current blocker:** Cloud Billing / Gemini provider access.  
**Observed provider result:** HTTP `403 PERMISSION_DENIED`.  
**Observed Billing setup error:** `OR_BACR2_59`.

**Important:** do not substitute another Google Cloud project merely because a new API key can be created there. Any project change requires an explicit architecture decision and registry update.

**Google Workspace / operational account:** `alexandre@primedigitalhub.com.br` — VERIFIED as relevant PRIME Google-side operational identity.

Detailed payment/billing identifiers belong in the private Google Cloud/Payments environment, not this public registry.

---

# 4. GOOGLE APPS SCRIPT / TRANSCRIPT AUTOMATION

**Project name:** `PRIME Digital Hub — Google Meet Transcript Automation`  
**Script ID:** `1ZCiOyQPRQocSMbAER9c0FelY494I5TTLP639XWdrzmNrSqzbekNIByB5`  
**Runtime:** `V8`  
**Primary function:** `processPipeline`  
**Operational role:** Google Meet / Drive transcript automation feeding PRIME ingestion.  
**Status:** **CANONICAL / ACTIVE**.

**Canonical ingest endpoint:** `https://www.primedigitalhub.com.br/api/pipeline/ingest` — **CANONICAL / PROVEN**.

### Legacy endpoint — DO NOT USE

`https://prime-digital-hub-final-deploy-with-secret-laxivzvvi.vercel.app/api/ingest`  
Classification: **LEGACY / DEPRECATED / DO NOT USE**.

### Historical runtime

`Rhino / DEPRECATED_ES5` — **DEPRECATED / DO NOT RESTORE**.

> The V8 status above is incorporated from the later audited state supplied for this checkpoint. Do not revert to Rhino. If future direct Apps Script inspection contradicts this, record the contradiction rather than silently overwriting history.

---

# 5. NEON / DATABASE

**Project ID:** `holy-block-04720208`  
**Project name:** `neon-sky-forest`  
**Canonical branch:** `br-cold-cloud-anwml3lu`  
**Database:** `neondb`  
**Status:** **CANONICAL / VERIFIED**.

**Operational role:** persistent pipeline state, transcripts, PipelineRuns, PipelineEvents and downstream learning artifacts/projections.

Do not create or migrate to another Neon project as a troubleshooting shortcut without an explicit architecture decision recorded here.

---

# 6. CANONICAL PIPELINE IDENTITIES / ENDPOINTS

**Ingestion:** `POST https://www.primedigitalhub.com.br/api/pipeline/ingest`  
Authentication header name: `x-prime-pipeline-secret`  
Secret value: **NEVER STORE HERE**.

**Retry:** `POST /api/admin/pipeline/retry`  
Status: **IMPLEMENTED / DEPLOYED / FROZEN pending provider recovery**.

**Gemini healthcheck:** `GET /api/admin/gemini-healthcheck`  
Status: **IMPLEMENTED; provider currently returns 403 until Billing/access is resolved**.

---

# 7. CURRENT CANONICAL EXECUTION GATES

### GATE 1 — TRANSPORT FOUNDATION

Drive → Apps Script → Ingest → Transcript Persistence → PipelineRun → Prompt 1 reached  
**Status: PROVEN / LOCKED.**  
Reopen only for new regression evidence, code/runtime change, contradiction or changed requirement.

### GATE 2 — GEMINI PROVIDER

Billing → Gemini access → healthcheck  
**Status: BLOCKED.**  
Current blocker: `OR_BACR2_59` / HTTP `403`.

### GATE 3 — COGNITIVE PIPELINE

Prompt 1 → Prompt 2 → Prompt 3 → Prompt 4 → Evidence → Signal → Insight → Report / Portfolio  
**Status: NOT YET VALIDATED END-TO-END.**

### GATE 4 — CONTROLLED PRODUCTION VALIDATION

GL-003 → one controlled Laura retry  
**Status: BLOCKED.**

### GATE 5 — FULL E2E

Real transcript → transport → persistence → Gemini → cognitive artifacts → Dashboard / Portfolio → final traceable evidence  
**Status: PENDING.**

---

# 8. WHERE WE ARE → WHAT IS PROVEN → WHAT IS BLOCKED → WHERE WE GO

This section is a **navigation checkpoint**, not a second technical design. Its purpose is to let a future agent, Codex, developer or human resume work immediately without repeating completed investigations.

## WHERE WE ARE NOW

The canonical project is correctly identified across the principal layers: GitHub repository, Vercel project, Google Cloud project, Apps Script automation and Neon database. The transport foundation has been demonstrated through the point at which Prompt 1 is reached.

The active blocker is downstream of transport: the Gemini provider currently rejects the project request with HTTP `403 PERMISSION_DENIED`, and the associated Google Cloud billing setup is blocked by `OR_BACR2_59`.

## WHAT IS PROVEN / LOCKED

- Canonical GitHub repository identity.
- Canonical Vercel project identity as previously audited.
- Canonical Google Cloud project identity.
- Canonical Apps Script project identity and V8 runtime status as recorded in the audited checkpoint.
- Canonical ingestion endpoint.
- Drive → Apps Script → portal ingestion path through transcript persistence and `PipelineRun` creation.
- Prompt 1 is reached before the observed Gemini provider failure.
- The historical six-run breakpoint is `GeminiGenerationFailed` / HTTP `403`, followed by failed pipeline state and absence of downstream artifacts.
- The old Vercel ingest endpoint and Rhino runtime are legacy/deprecated and must not be revived as troubleshooting shortcuts.

**LOCK RULE:** Do not reopen any item above merely because a new agent has not personally inspected it. Reopen only with new contradictory evidence, regression evidence, a relevant code/runtime change, or a changed requirement.

## WHAT IS BLOCKED

- Gemini provider access.
- Google Cloud billing/provider activation required for successful Gemini generation.
- Full cognitive pipeline validation.
- GL-003 execution.
- Controlled Laura retry.
- Full end-to-end production validation.

## WHERE WE GO NEXT

The next operational path is **not** another transport investigation. It is:

1. Resolve the Google Cloud Billing / provider-access restriction.
2. Confirm the canonical `prime-hub-portal` project has active billing/provider access.
3. Run only the minimum Gemini healthcheck and require a successful provider response.
4. Reassess production environment configuration only if the healthcheck passes or produces new evidence.
5. Validate the cognitive pipeline through the approved gates.
6. Only after the preceding gates pass, prepare the controlled GL-003 / Laura validation.
7. Preserve the resulting evidence in a new dated snapshot.

## STOP CONDITIONS

Stop and report instead of improvising when:

- a canonical identifier conflicts with a platform's direct evidence;
- a supposedly locked fact is contradicted;
- a proposed fix requires changing an environment, credential, deployment, trigger or architecture decision not authorized by the current task;
- a legacy resource appears to be required for current operation;
- a new test would merely reproduce an already-proven failure without answering a new question.

---

# 9. LEGACY / WRONG / DO NOT USE REGISTER

| Resource | Classification | Replacement / canonical resource |
|---|---|---|
| Old Vercel ingest endpoint | LEGACY / DEPRECATED / DO NOT USE | `https://www.primedigitalhub.com.br/api/pipeline/ingest` |
| Rhino Apps Script runtime | DEPRECATED / DO NOT USE | V8 |
| Similar-name external GitHub repositories | EXTERNAL / DO NOT USE unless explicitly verified | `alexmelloenglish-gif/prime-hub-portal` |

For every future finding record: resource type; exact name/ID/URL; classification; reason; evidence/source; replacement/canonical resource; date; verifier.

---

# 10. PENDING VERIFICATION — DO NOT GUESS

- Exact canonical Production domain/deployment mapping in Vercel.
- Current Production deployment SHA mapping after each approved deployment.
- Additional PRIME-owned GitHub repositories that should be ACTIVE, LEGACY or ARCHIVE.
- Google Cloud numeric project ID if operationally useful.
- Current active Billing account after the Google restriction is resolved.
- Old Google Cloud projects that should be LEGACY rather than UNKNOWN.
- Full inventory/classification of similarly named Apps Script projects.
- Full inventory/classification of old Vercel projects/deployments.
- Full inventory of GitHub repositories owned by the PRIME operator before cleanup.

---

# 11. CHANGE CONTROL

Never silently replace an identifier.

When a resource changes:

1. Preserve the old value.
2. Mark it `LEGACY` / `DEPRECATED` with date and reason.
3. Add the new canonical value.
4. Record the evidence proving the change.
5. Do not delete historical entries merely to make the registry look cleaner.

A `CANONICAL` resource should only be replaced by direct evidence from the owning platform or an explicit architecture decision.

---

# 12. FUTURE-AGENT CONTRIBUTION CONTRACT

Before contributing, read:

1. `docs/DO_NOT_REINVESTIGATE.md`
2. `docs/PRIME_CANONICAL_PROJECT_REGISTRY.md`
3. `docs/PRIME_CANONICAL_CURRENT_STATE.md`
4. `docs/PRIME_FORENSIC_SNAPSHOT_2026-08-31.md`
5. The specific subsystem snapshot relevant to the task.

Do not redesign architecture or clean up/delete resources during registry work. Verify operational identity only.

Never invent an ID, URL, project, owner, account, deployment, branch or relationship. Never store credentials or student content. Do not delete, archive, rename, migrate or disconnect anything during registry work.

If evidence conflicts with an existing `CANONICAL` entry, **STOP and report the contradiction** instead of silently overwriting it.

For proposed additions/corrections, report:

```text
RESOURCE TYPE:
EXACT NAME:
ID / URL (safe identifiers only):
PROPOSED CLASSIFICATION:
CURRENT ROLE:
EVIDENCE / SOURCE:
RELATIONSHIP TO EXISTING REGISTRY:
VERIFICATION STATUS:
CONTRADICTION FOUND?: YES/NO
NOTES:
```

---

# 13. NEXT PHASE — CLEANUP NOT STARTED

The cleanup phase must use this registry as its source of truth and must classify before deleting, archiving, renaming or disconnecting anything.

**REGISTRY STATUS: CANONICAL / INITIAL WORKING VERSION — 2026-08-31**

> 🚨 **DO NOT RE-INVESTIGATE THE IDENTITY MAP. CONSULT THIS REGISTRY FIRST. VERIFY ONLY OPEN/PENDING ITEMS OR CONTRADICTORY EVIDENCE.**

# 🚨 DO NOT RE-INVESTIGATE
# PRIME DIGITAL HUB — ANTI-REWORK / SNAPSHOT GUARDRAIL

**Purpose:** prevent repeated audits, repeated implementation, contradictory conclusions and unnecessary execution when the PRIME investigation is resumed by another agent, Codex session, developer or operator.

**Rule #1:** READ THIS BEFORE TOUCHING THE INVESTIGATION.

---

## 🚨 STOP — DO NOT START OVER

This repository contains canonical snapshots of work that has already been investigated and/or proven.

A new agent must **not** restart an investigation simply because it has not personally performed it.

A finding marked:

```text
PROVEN
DONE
LOCKED
CONFIRMED
PRESERVED
```

is an established checkpoint for this project unless **new contradictory evidence** exists.

The burden is therefore:

```text
NEW EVIDENCE → REOPEN INVESTIGATION
NO NEW EVIDENCE → CONTINUE FROM SNAPSHOT
```

---

# 1. FIRST-READ ORDER

Before making any change or running any diagnostic, read:

1. **THIS FILE** — `docs/DO_NOT_REINVESTIGATE.md`
2. `docs/PRIME_CANONICAL_CURRENT_STATE.md`
3. `docs/PRIME_FORENSIC_SNAPSHOT_2026-08-31.md`
4. `docs/snapshot-apps-script-prompt1-gemini-2026-08-31.md`
5. Only then inspect source, runtime or external systems as required by the current blocker.

These documents are the project's forensic return points.

---

# 2. ALREADY PROVEN — DO NOT REPEAT WITHOUT NEW EVIDENCE

For the current checkpoint:

```text
NEON SCHEMA FORENSIC AUDIT         = DONE
SIX HISTORICAL RUN AUDIT           = DONE
LAURA HISTORICAL RECORD AUDIT      = DONE
IDEMPOTENCY STRUCTURAL AUDIT       = DONE
RETRY IMPLEMENTATION               = DONE / DEPLOYED
APPS SCRIPT PROJECT IDENTIFICATION = DONE
DRIVE → PORTAL TRANSPORT           = PROVEN
HTTP INGESTION                     = PROVEN
TRANSCRIPT PERSISTENCE             = PROVEN
PIPELINERUN CREATION               = PROVEN
PROMPT 1 REACHED                   = PROVEN
PORTAL → GEMINI LOCALIZATION       = PROVEN
```

Do not redo Neon schema inspection, historical-run reconstruction, idempotency analysis or transport testing merely to “make sure.”

Reopen only if a new runtime event, source change, deployment change or contradictory record challenges the existing evidence.

---

# 3. DO NOT MISATTRIBUTE THE HISTORICAL 403

The historical breakpoint is:

```text
Transcript persisted
        ↓
PipelineRun created
        ↓
Prompt 1 reached
        ↓
GeminiGenerationFailed
        ↓
HTTP 403
        ↓
PipelineRun failed
        ↓
no downstream cognitive artifacts
```

Canonical causal status:

```text
PROMPT_1_403_CAUSED_BY_APPS_SCRIPT = NOT_PROVEN
```

The audited portal architecture localizes the Gemini call to the portal runtime after ingestion. Do not rewrite the causal history to blame Apps Script without direct source/execution evidence.

---

# 4. CURRENT BLOCKER — DO NOT LOOK BACKWARD

The active operational blocker at this checkpoint is:

```text
GOOGLE CLOUD BILLING / GEMINI PROVIDER ACCESS
```

Reported provider health result:

```text
HTTP 403
PERMISSION_DENIED
Your project has been denied access. Please contact support.
```

Reported Billing setup error:

```text
OR_BACR2_59
Unable to complete billing setup.
Unable to configure your account.
```

Therefore the next investigation begins here. Do not return to Drive, Apps Script, Neon or retry implementation unless new evidence requires it.

---

# 5. EXECUTION LOCK

Until the Gemini provider gate passes:

```text
LAURA RETRY = BLOCKED
GL-003 = BLOCKED
FULL PIPELINE = BLOCKED
```

Do not use a new transcript as a substitute for the provider healthcheck.

Do not create repeated billing accounts as a troubleshooting loop.

Do not modify Apps Script, schema or retry architecture merely to bypass the current provider gate.

---

# 6. PROOF STANDARD

Use the following hierarchy when deciding whether an investigation is actually closed:

```text
SPECIFICATION  = establishes intent
IMPLEMENTATION = establishes existence
EXECUTION       = establishes operation
PERSISTENCE     = establishes durable state
PROVENANCE      = establishes causality
COMPLETE TRACE  = establishes runtime verification
```

Do not promote a hypothesis to “PROVEN.”
Do not demote a proven finding to “UNKNOWN” merely because a new agent did not personally reproduce it.
Do not merge independent errors without runtime evidence.

---

# 7. HOW TO UPDATE THIS GUARDRAIL

When new evidence arrives:

1. Preserve the previous historical state.
2. Add the new checkpoint to the canonical snapshot.
3. Explicitly state what changed.
4. Explicitly state what did **not** change.
5. Move only the affected item from `PROVEN/DONE/LOCKED` to `OPEN/RECHECK` if justified.
6. Record the source/deployment SHA or external evidence reference when applicable.
7. Update the “CURRENT STOP POINT.”

Never silently rewrite history.

---

# 8. SECURITY

This is a public repository.

Never put into these snapshots:

- passwords;
- 2FA codes;
- API keys;
- private keys;
- pipeline secrets;
- full payment-card information;
- CVV;
- sensitive authentication tokens;
- private student transcript content unless explicitly approved and appropriately protected.

Snapshots must preserve operational facts without becoming a credential store.

---

# 9. CURRENT RETURN POINT

```text
WHERE WE CAME FROM:
  Architecture / schema / ingestion / persistence / retry forensic work

WHERE WE ARE:
  Transport proven → Prompt 1 reached → Gemini provider returns 403
  Cloud Billing setup blocked by OR_BACR2_59

WHERE WE ARE GOING:
  Resolve Billing/provider access
  → minimal Gemini healthcheck PASS
  → retry pre-flight
  → GL-003 safety gate
  → one controlled Laura retry
  → full end-to-end validation
```

**Do not start over. Continue from the current stop point.**

---

# 10. FIVE-GATE VALIDATION MODEL

This is the canonical validation sequence. It separates already-proven transport, the current external provider blocker, cognitive validation, controlled production validation, and the final real-world end-to-end proof.

```text
GATE 1 — TRANSPORT FOUNDATION
Drive → Apps Script → Ingest → Persistence → PipelineRun → Prompt 1 reached
STATUS = PROVEN / LOCKED
REOPEN ONLY IF = regression / code change / runtime change / contradictory evidence

GATE 2 — GEMINI PROVIDER
Billing → project billing linkage → Gemini access → minimal healthcheck
STATUS = BLOCKED
CURRENT BLOCKER = OR_BACR2_59 / HTTP 403 PERMISSION_DENIED

GATE 3 — COGNITIVE PIPELINE
Prompt 1 → Prompt 2 → Prompt 3 → Prompt 4
→ Evidence → Signal → Insight → Report / Portfolio
STATUS = NOT YET VALIDATED END-TO-END

GATE 4 — CONTROLLED PRODUCTION VALIDATION
GL-003 → one controlled Laura retry
STATUS = BLOCKED

GATE 5 — FULL E2E
Real transcript
→ transport
→ persistence
→ Gemini
→ cognitive artifacts
→ Dashboard / Portfolio
→ final traceable evidence
STATUS = PENDING
```

**Gate 5 is distinct from Gate 4.** A controlled retry can validate production behavior without, by itself, proving the complete real-transcript-to-student-surface lifecycle. The project reaches final E2E proof only when the whole chain is observed with durable artifacts and traceable evidence.

Master rule:

> **A PROVEN / LOCKED gate does not return to INVESTIGATE without new evidence of regression, contradiction, code/runtime change, or changed requirement.**

---

# 🚨 STATUS

**DO NOT RE-INVESTIGATE — CONTINUE FROM CANONICAL SNAPSHOT.**

Last canonical checkpoint: **2026-08-31**  
Current blocker: **Google Cloud Billing / Gemini provider access**  
Gate 1: **PROVEN / LOCKED**  
Gate 2: **BLOCKED**  
Gate 3: **NOT YET VALIDATED E2E**  
Gate 4: **BLOCKED**  
Gate 5: **PENDING**  
Laura retry: **BLOCKED**  
GL-003: **BLOCKED**

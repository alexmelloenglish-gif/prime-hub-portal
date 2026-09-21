# PRIME Source-Bound Proof Checklist v1.0

**Status:** CANONICAL / adopted 2026-09-21  
**Purpose:** prevent status claims from outrunning the evidence that supports them.

## Rule

Before any PRIME status report uses:

- DONE
- PROVEN
- DEPLOYED
- VALIDATED
- RESOLVED
- COMPLETE

the report must bind that claim to the exact evidence boundary below.

```text
Source boundary:
- Branch/PR:
- Commit:
- File paths / runtime traces:
- Deployment ID / READY state:
- Tests/build logs:
- What this proves:
- What this does not prove:
```

## Interpretation

A field may be marked **not applicable** only when it is genuinely irrelevant to the claim.

Examples:

- documentation-only adoption does not require a production deployment;
- a production-runtime claim does require deployment identity and runtime/user-facing evidence;
- a data-persistence claim requires persistence/read-back evidence, not only build success;
- an implementation claim may be valid without execution proof, but must be called **IMPLEMENTED**, not **PROVEN E2E**.

## Evidence hierarchy

```text
SPECIFICATION
→ IMPLEMENTATION
→ EXECUTION
→ PERSISTENCE
→ PROVENANCE
→ COMPLETE TRACE
```

Do not skip levels by wording.

## Required non-claims

Every closeout must say what remains outside the proof boundary.

Examples:

- projection proof does not prove learner execution;
- attendance proof does not prove learning;
- build PASS does not prove runtime correctness;
- HTTP 200 does not prove persistence;
- teacher-approved candidate does not prove projection delivery unless the delivery/read-back was observed.

## Partial evidence language

When evidence is incomplete, use:

> In [branch/PR/commit], the available evidence supports [specific claim] within [scope]. It does not yet prove [remaining boundary].

## Historical source discipline

A later correction or stronger proof does not retroactively make an earlier branch/PR a valid proof source for a claim it did not establish.

Historical audits remain historical.

## Operational consequence

If the evidence package is incomplete, the closeout status must remain one of:

```text
IMPLEMENTED
OBSERVED
PARTIAL
INFERRED
UNKNOWN
BLOCKED
NOT YET VERIFIED
```

until the required proof is available.

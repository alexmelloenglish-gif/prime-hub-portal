
# PRIME Governance Control Center v1.0

Status: ADOPTED — system governance entry point / 2026-09-21

This directory is the control layer for the PRIME system.

## Start here

1. PRIME_SYSTEM_GOVERNANCE_CANON_v1.md
2. PRIME_MASTER_GOVERNANCE_AUDITOR_PROMPT_v1.md
3. ../PRIME_CANONICAL_PROJECT_REGISTRY.md
4. ../PRIME_CANONICAL_CURRENT_STATE.md
5. ../DO_NOT_REINVESTIGATE.md
6. relevant domain contract / ADR / implementation gate
7. relevant validator / self-test
8. `SOURCE_BOUND_PROOF_CHECKLIST_v1.md`
9. `../operations/PRIME_TODO_AND_HANDOFF_2026-09-21.md`
10. runtime/deployment evidence when required

## Control loop

    TASK
      ↓
    CLASSIFY
      ↓
    READ CANON
      ↓
    MAP EXPECTED PROCESS
      ↓
    IDENTIFY AUTHORITY
      ↓
    IMPLEMENT / AUDIT
      ↓
    VERIFY
      ↓
    PROVE
      ↓
    UPDATE DECISION / CHECKPOINT

## Important finding

The repository already contains substantial domain governance. This layer does not replace it.

Its purpose is to prevent fragmentation by giving every future agent/operator one system-level entry point and one reusable audit protocol.

## Mandatory rule

No implementation without process visibility.

## Future machine extensions

- automated system-map validator;
- canonical contract index;
- task/change packet template;
- machine-readable authority registry;
- proof-package generator;
- drift detector between canon, code and deployment.

# Learning Journey Amendment — Adoption and Contract Registry

**Date:** 19 September 2026
**Classification:** CANONICAL CORE
**Status:** PROPOSED / review branch; adoption requires merge.
**Baseline:** `d69f16ccfc4b26e0bbf75fcffc5310012fd7a235`.

## Governing decision

Learning events and their teacher-validated meaning must remain visible even when the recorded learner state is retained. Subject/task purpose and opportunities for use constrain every comparison. This is an architecture-of-meaning change across the system, not only a wording adjustment in one Portfolio.

Language programmes include expression and participation through the language, as well as learning about it. Evidence of access to a content task through English, personal appropriation of language, and subject understanding must remain distinct. Meaningful supported participation is not invalidated by the absence of a later content-retention claim.

## Contract registry

| Layer | Proposed authority | Explicit compatibility effect |
|---|---|---|
| Constitution | [System Governance Canon v1.0](PRIME-SYSTEM-GOVERNANCE-CANON.md) | Highest authority for pedagogical meaning; preserves operational authorization controls. |
| Machine | [Learning Machine Canon v1.0](PRIME-LEARNING-MACHINE-CANON.md) | Separates learning event, interpretation and state decision; derives contextual narrative rules. |
| Class Report | [v1.1](../architecture/CLASS-REPORT-PRESENTATION-CONTRACT-V1.1_2026-09-19.md) | Ten semantic obligations remain; learner-facing order and support/correction presentation change explicitly. |
| Portfolio | [Contract v1.2](../architecture/STUDENT-LEARNING-PORTFOLIO-PRESENTATION-CONTRACT-V1.2_2026-09-19.md), [Template v1.1](../student-learning-portfolio-template-v1.1.md) | Nineteen-section outer design retained; semantic amendments versioned. |
| Dashboard / Tracker | [Presentation Contract v1.1](../student-dashboard-presentation-contract-v1.1.md) | NOW/RECENT/MEMORY and four label colors retained; event narrative independent of classification or state change. |
| Audit | [Baseline findings](../audits/LEARNING_JOURNEY_PRESENTATION_AUDIT_2026-09-19.md) | Source audit, priorities and acceptance cases; no production certification. |

Legacy contracts, JSON, templates and historical audits remain unchanged as versioned evidence. The links above determine this amendment's scope; they do not rewrite historical claims of conformance. The G1–G6 authority/provenance architecture remains in force.

## Implementation and release sequence

1. Review and adopt the versioned constitutional and derived contracts.
2. Design the versioned representation of learning events/context and mappings to existing teacher/canonical evidence. Preserve existing lineage, hashes and historical versions.
3. Update prompts, validation and renderers together; the old Class Report JSON is not a v1.1 validator.
4. Verify the synthetic scenarios in the Machine/Dashboard contracts, including no state update and incomparable task conditions. Use teacher-reviewed private pilot evidence without publishing private learner records in this public repository.
5. Update external visual masters and versioned student artifacts with their own review and read-back evidence.
6. Validate preview, then use the existing approval/deployment process. Record the actual deployed revision before claiming runtime compliance.

## Status separation

| Claim | Status in this change |
|---|---|
| Normative contracts and source audit prepared | Yes |
| Adopted on main | Pending merge |
| Prompts / schema / adapters updated | Not implemented here |
| JSON validation and Dashboard rendering updated | Not implemented here |
| External Google master / family PDFs updated | Not updated here |
| Production runtime compliance | Not verified |

Retaining this distinction prevents a documentation merge from being mistaken for an implemented or deployed learning system.

## Execution handoff — 19 September 2026

Continue implementation through the [shared manual/automatic machine handoff](../operations/LEARNING_MACHINE_EXECUTION_HANDOFF_2026-09-19.md) and [PR #41](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/41). The existing complete v2.1 manual is now archived as a source reference in this branch; do not reconstruct the intermediate machine from final learner outputs. Manual and automatic initiation share the same processing and authority path. The next deliverable is an inspectable execution, not another general architecture audit.

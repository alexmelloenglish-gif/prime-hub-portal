# Unified Lesson & Portfolio Contract vNext

Status: DRAFT FOR IMPLEMENTATION VALIDATION
Date: 2026-09-20

## 1. Scope
Defines the shared authoritative representation from which Class Reports, Portfolio memory, Teacher views, Learner views, Family views and next-lesson planning derive. A lesson has stable identity and versioned structured representation. Reprocessing is traceable and must not duplicate evidence or alter pedagogical occurrence date.

## 2. Identity and provenance
Evidence-bearing records identify where applicable: studentId; lesson identity; source/location; observed author when reliably attributable; occurrence time; processing time; support/context; version; applicable teacher decision/version; authorized audiences.
Authentication email is account identity, not learner authority. Account→Learner authorization resolves access. Ambiguous authorship must not be attributed automatically.

## 3. Orthogonal state dimensions
Teacher review: PENDING_REVIEW | TEACHER_CONFIRMED | TEACHER_EDITED_CONFIRMED | NOT_CONFIRMED.
Applicability: APPLICABLE | NOT_APPLICABLE | UNDETERMINED.
Evidence: SUFFICIENT_FOR_CLAIM | INSUFFICIENT_EVIDENCE | NO_EVIDENCE_RECORDED | NOT_OBSERVED.
Data: AVAILABLE | NOT_AVAILABLE.
Publication: NOT_PUBLISHED | PUBLISHING | PUBLISHED | PUBLICATION_FAILED.

Teacher confirmation may confirm insufficient evidence; confirmation never upgrades evidence strength.

## 4. Lesson archive
Completed lesson + pending report: lesson exists, report pending.
Transcript unavailable: lesson remains; teacher observations may support report with explicit provenance.
Corrected confirmed report: new version current; prior version auditable.
Rejected interpretation does not delete verified facts.
Cancellation/absence records operational event without invented production.
All confirmed Class Reports remain in Portfolio history, versioned.

## 5. Evidence semantics
Occurrence and learning claims differ.
Material occurrence ≠ learner retrieval.
Teacher model ≠ independent production.
Retrieval with clue = supported retrieval.
Appropriate unsupported use = independent use in that occurrence.
Later evidence may support retention.
Derived reports/dashboards citing an episode never create additional evidence or recursively amplify claims.

## 6. Idempotency and chronology
Reprocessing cannot duplicate attendance, vocabulary occurrences, corrections, reports or evidence. Late old lessons retain original pedagogical chronology. Source corrections and processor improvements create traceable versions.

## 7. Teacher approval authority
Approval targets an identifiable proposal version, sources and prior-memory version.
Flow: PREPARE → REVIEW/EDIT → RECOMPUTE DEPENDENCIES → FINAL REVIEW → CONFIRM → AUTHORIZE CONTRACTED CONSEQUENCES.
Rejected claims disappear from dependent products before final confirmation.
One UI approval may cover a set, while audit records item-level confirmed/edited/rejected outcomes.
Stale proposals require reconciliation if learner memory changed during review.

## 8. Confirmation, publication and communication
Independent outcomes. Confirmation may succeed while publication fails. Retry publication without new pedagogical confirmation for the same version. Preserve last consistent consumer version while update incomplete. Read-back/hash verifies delivery integrity, not pedagogical quality.
Communication is separately authorized; approval never authorizes arbitrary future messages.

## 9. Longitudinal promotion
No universal repetition-count mastery rule.
Independent production requires identifiable task, learner production and support conditions.
Established strength requires consistent longitudinal evidence with relevant independence/context.
Recurring priority requires recurrence or explicitly justified pedagogical impact.
Resolved priority requires evidence addressing its origin.
Language development requires pertinent work/use with context/support.
What Changed requires previous state + new comparative evidence.
Important needs may become priorities on first occurrence by justified teacher decision.
No recent evidence ≠ loss. No demonstrable change ≠ obligation to narrate progress. Current State may remain unchanged, partial or empty.

## 10. Portfolio
PORTFOLIO = LESSON ARCHIVE + CUMULATIVE LEARNING MEMORY.
Class Reports preserve lesson history. Cumulative banks preserve longitudinally useful information with provenance/support. Current-state change never deletes history.

## 11. Projection contracts
All projections derive from compatible confirmed decisions but differ by audience.
Teacher: detailed evidence, typed hypotheses, uncertainty, planning.
Learner/Young Learner: meaning-first and age-appropriate; never inflate supported performance into unsupported "Now I can".
Family: pertinent longitudinal narrative, evidence, teacher interpretation and next direction; reduce technical detail without reducing truth.

## 12. Awareness Layer
Publication availability is not awareness.
Authorized audience telemetry may record:
AVAILABLE → DELIVERED → VIEWED → ACKNOWLEDGED; optional FEEDBACK_RECEIVED.
These are engagement facts, not learning-state authority.
For minors, the system may surface FAMILY_AWARENESS_PENDING when a meaningful authorized update has not been reasonably surfaced/noticed. Page load must not be interpreted as comprehension.
Awareness candidates may arise from cycle completion, meaningful movement, sustained concern, requested action, significant direction change, or teacher-created communication need.
System may recommend communication; timing/wording remain human-controlled unless an explicit automation contract authorizes otherwise.

## 13. Diary and Next Lesson
Type content OBSERVED | HYPOTHESIS | PLANNED.
Planned activity becomes history only when execution is evidenced. Hypothesis may guide checking but cannot become canonical state merely because it was planned.

## 14. Gustavo Golden-Witness acceptance criteria
1. Same lesson reprocessed → no duplicates.
2. Source records no correction → no difficulty invented.
3. Word only spoken by teacher → no independent retrieval claim.
4. Teacher rejects interpretation → removed from dependent proposals.
5. Confirmed report corrected → versioned replacement + derivatives updated.
6. Old lesson arrives late → chronology preserved.
7. Publication fails after confirmation → retry without reapproval.
8. Proposal uses stale memory → reconcile before apply.
9. Unreliable speaker identity → no automatic learner attribution.
10. Planned activity → never recorded as performed without evidence.
11. Processor improvement → never presented as learner progress.
12. Learner self-rating → self-perception, never proficiency.
13. Family/Learner/Teacher projections → compatible with one evidence history.
14. Family projection published but unseen → publication cannot become acknowledgement.
15. Communication sent → canonical pedagogical state unchanged.

## 15. Release gate
Do not generalize by copying Gustavo UI.
Generalization requires contract-backed representation, acceptance suite, Golden-Witness historical run, separation of recovered evidence vs interpretation changes vs contract changes vs actual learning changes, preview validation, and explicit release decision.

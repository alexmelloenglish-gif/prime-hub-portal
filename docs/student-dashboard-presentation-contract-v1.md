# Student Dashboard Presentation Contract v1

Status: canonical presentation contract
Validation witness: Eduarda Coelho Gabriel
Temporal model: NOW → RECENT → MEMORY

## Purpose

Preserve evidence and pedagogical decisions while removing the system's explanation of how those decisions were constructed from the student's experience.

The student dashboard is a learning interface, not an audit interface.

## Canonical temporal structure

### NOW
- Current State
- What Changed — render only when supported by evidence
- What Matters Now
- Next Step

### RECENT
- Recent learning
- Recent attended lessons
- Concise recent report highlights when useful

### MEMORY
- Learning History
- Skills & Patterns
- Vocabulary to Reuse
- Grammar & Accuracy
- Teacher Feedback
- Learning Links

No fourth temporal layer such as LONGITUDINAL is permitted in the student-facing presentation. Complete class-report history belongs under MEMORY → Learning History.

## Current State

Current level, target level, objective and learning focus may be shown only from authorized learner state.

Student-facing authority is implicit in publication. The learner should not be asked to interpret validation mechanics.

Positive provenance labels such as "Teacher confirmed", "Teacher validated", "Teacher authorized", "AI generated", "System detected", "Portfolio confirmed" or similar governance language must not appear on the learner surface. If a state is genuinely unavailable, "Not available" may be shown because the absence itself is meaningful to the learner.

Internal distinctions such as teacher-validated, portfolio-confirmed, qualified, canonical, repository, source authority, model/provider provenance or projection version remain teacher/audit implementation details.

AI may assist in producing candidates, summaries or structured proposals, but it does not receive student-facing authorship or authority credit. Publication authority belongs to the PRIME learning process and its human gate; that governance stays behind the interface.

## What Changed

What Changed represents a supported pedagogical change since the prior state.

It must not describe:
- data reconciliation
- portfolio correction
- migration
- publication
- canonicalization
- projection repair
- pipeline processing
- changes to system state

If no supported pedagogical change exists, What Changed may be absent or state that no confirmed change is available.

## What Matters Now

Show a small set of current pedagogical priorities tied to evidence.

Priorities should explain:
- what matters
- why it matters

Avoid internal evidence-state vocabulary.

## Next Step

Show the action in language the learner can understand and act on.

The learner-facing action must describe what the learner will do or experience. Teacher lesson-plan instructions ("start with...", "observe...", "prioritize...", "check whether...", "conduct...") must remain teacher-side and must never be used as the student's Next Step description.

Do not expose:
- Evidence
- Learning signal
- Insight
- Boundary
- Next verification
- authorizationStatus
- canonical state transitions

When the destination is the booking calendar, the action label must describe the real action, e.g. "Book next support lesson".

## RECENT

Recent is a concise view of recent learning, not a second full history.

Avoid duplicating the same content as both attendance and report summaries unless each view adds distinct learner value.

Pending records, when shown, use learner-facing language such as "Needs confirmation", not technical evidence-boundary language.

## MEMORY

Learning History preserves complete published class-report history.

Class reports are collapsed by default, especially on mobile. The learner sees the lesson date/title first and chooses when to open the detail.

Class reports use learner-facing labels:
- What you worked on
- What we noticed

The dashboard has one centralized Next Step. Do not repeat teacher planning or "next verification" instructions inside every historical report.

Internal source strings may continue to preserve evidence, interpretation, boundary and verification semantics, but these labels must not leak into the student-facing interface.

Skills and patterns may explicitly show Not Assessed when evidence is insufficient.

Vocabulary interactions use natural action language:
- Write your own sentence
- Save my sentence
- Your saved sentences

## Technical-language boundary

The following terms must not appear as explanatory product language in the student dashboard:
- canonical
- projection
- repository
- runtime
- pipeline
- publication boundary
- source authority
- LearningSignalProposal
- TeacherInsightProposal
- CoachingRecommendation
- Transfer Points
- Evidence Boundary
- Boundary
- Next verification
- projection version identifiers

Technical metadata may remain in storage, tests, audit views and Teacher Intelligence where operationally necessary.

## Admin preview

"Admin preview active" is allowed only when an authorized admin is explicitly previewing another student's dashboard.

It must never appear during the learner's own normal session.

## Invariants

- NOW may be incomplete.
- Do not infer CEFR advancement from lesson count.
- Do not invent progress percentages.
- Do not manufacture What Changed.
- Do not turn source-only records into attended lessons or learning claims.
- Historical reports remain accessible.
- The learner sees the pedagogical result; system construction and audit reasoning stay behind the interface.

## Eduarda validation witness

Eduarda remains:
- Current level: CEFR A1
- Target: CEFR A2
- Seven attended lessons in the learner-facing learning history

Her validated What Changed is a pedagogical priority shift:
"Complete written responses became a clearer priority."

This is grounded in the 17 August Geography lesson and continued guided production on 19–20 August 2026.

## Acceptance criterion

A dashboard conforms to Presentation Contract v1 when a learner can answer these questions without encountering engineering language:

1. Where am I now?
2. What changed?
3. What matters most now?
4. What should I do next?
5. What happened recently?
6. What should I remember from my learning history?


## Enforcement model

This contract is enforced in code, not by relying on prompt obedience alone.

- Generated or imported learner-facing strings pass through a runtime language policy gate.
- Internal governance vocabulary and teacher-only lesson-plan phrasing fail closed to a neutral learner-safe fallback.
- Positive authority/provenance badges are not rendered on the learner surface.
- Student-dashboard CI runs a dedicated learner-facing language policy self-test.
- Class Reports must remain collapsed by default.
- A future content generator may propose content, but it cannot bypass the deterministic learner renderer or the build gate.

Teacher/audit views may preserve full provenance, evidence, model/provider metadata, boundaries and authorization state.

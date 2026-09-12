# PRIME Learning OS — Product Thesis

**Version:** 0.1 — Discovery  
**Date:** 2026-09-12  
**Status:** CANONICAL DISCOVERY BASELINE — subject to deliberate refinement  
**Owner:** PRIME Digital Hub

## 1. Purpose

This document preserves the first consolidated product thesis for PRIME Learning OS. It separates what is already a product invariant from hypotheses that still require validation.

PRIME is not intended to replace the teacher. It is a learning-intelligence system that preserves teacher authority, turns learning interactions into usable context, and keeps pedagogical decisions alive between sessions.

## 2. Core product thesis

> **Intelligence prepares. Teacher decides. Dashboard explains. Companion activates. Student attempts create new evidence.**

The product is a closed learning loop rather than a collection of dashboards:

```text
LEARNING INTERACTION
        ↓
CAPTURE
        ↓
PRIME INTELLIGENCE
        ↓
CANDIDATE
        ↓
HUMAN AUTHORITY
        ↓
CANONICAL LEARNING RECORD
        ↓
   ┌───────────────┐
   ↓               ↓
DASHBOARD       COMPANION
Memory / Map    Action / Practice
                   ↓
                ATTEMPT
                   ↓
             NEW EVIDENCE
                   ↓
             PRIME TEACHER
                   ↓
              NEXT DECISION
                   ↺
```

## 3. Canonical product responsibilities

### Student Dashboard — Memory, transparency and direction

**Primary question:** “What does PRIME know about my learning, why is that interpretation valid, and where am I going?”

The Dashboard is the authorized longitudinal projection of learning. It is relatively stable and consultative.

Responsibilities:
- current teacher-validated state;
- target and pedagogical direction;
- what changed;
- current focus;
- relevant evidence;
- lesson history;
- authorized goals;
- selected vocabulary and learning memory;
- provenance and temporal distinctions where appropriate.

The Dashboard is the **map of learning**. It should not become a daily task manager.

### PRIME Companion — Action between learning interactions

**Primary question:** “What should I do now to continue learning?”

The Companion converts authorized direction into small, executable actions.

Canonical surfaces:
1. **Today** — what matters now and the next useful action.
2. **Practice** — vocabulary reuse, speaking, rewriting, homework and other short actions.
3. **Goals** — weekly priorities translated into executable steps.
4. **Prepare** — preparation, questions and context for the next interaction.

The Companion should create continuity, not duplicate Dashboard history.

It may capture:
- text attempts;
- audio attempts;
- rewrites;
- questions;
- reflections;
- preparation;
- task completion.

A student attempt is not automatically progress or validated evidence.

### PRIME Teacher — Decision and operational authority

**Primary question:** “What deserves my attention and what decision must I make now?”

PRIME Teacher is the teacher-facing operational product. It should not be a mobile clone of the Admin Panel.

Initial high-value surfaces:
1. **Today / Inbox** — decisions and exceptions requiring attention.
2. **Review** — candidate evidence, uncertainty and context.
3. **Students** — rapid learner context.
4. **Prepare** — next-session focus and preparation.

Typical actions:
- review;
- approve;
- edit;
- reject;
- return for revision;
- confirm next focus;
- create guidance;
- review student attempts;
- prepare the next interaction.

The system prepares; the teacher remains pedagogical authority.

### PRIME Intelligence — Invisible infrastructure

Responsibilities:
- capture authorized learning artifacts;
- preserve provenance;
- generate evidence/assessment candidates;
- identify uncertainty;
- prepare recommended next actions;
- route items to human review;
- support canonicalization only after authorized transitions.

Infrastructure complexity — GitHub, Vercel, WIF, hashes, model credentials and pipelines — must disappear from normal teacher and learner experience.

## 4. Canonical semantic boundaries

These distinctions are product invariants:

- **AI output ≠ pedagogical authority**
- **Attempt ≠ Evidence Candidate**
- **Evidence Candidate ≠ Teacher-validated Evidence**
- **Teacher-validated Evidence ≠ Assessment**
- **Assessment ≠ Progress**
- **APPROVED ≠ CANONICALIZED ≠ PROJECTED**
- **Dashboard never reads candidate state**
- **AI cannot directly write canonical learning state**
- **Teacher approval is an authority transition**
- **Student activity can create new material for review without creating learning truth**

Core object vocabulary should remain domain-agnostic where possible:

```text
Organization
Instructor
Learner
Program
Session
Source
Candidate
Evidence
Assessment
CanonicalRecord
LearningAction
Attempt
Projection
```

Avoid prematurely encoding English-specific assumptions into the platform core.

## 5. Closed learning loop

The target experience is:

```text
Real lesson / learning interaction
        ↓
Capture
        ↓
AI prepares interpretation
        ↓
Teacher reviews
        ↓
Teacher approves / edits / rejects
        ↓
Canonical learning state
        ↓
Dashboard explains
        ↓
Companion proposes authorized action
        ↓
Learner acts
        ↓
Attempt captured
        ↓
New evidence candidate
        ↓
Teacher reviews
        ↓
Next interaction begins with memory
```

The next session should not start from zero.

## 6. Product portfolio hypothesis

### PRIME Direct — B2C

PRIME/its teachers teach learners directly. This remains the live laboratory for the platform and the highest-control environment for validating pedagogy and workflows.

### PRIME Teacher — B2B2C

Subscription product for independent teachers and teaching professionals.

Value proposition hypothesis:

> **Know what happened. Know who needs you. Know what to do next.**

The teacher receives an intelligence workspace and can offer the Companion/Dashboard experience to their learners.

Potential model:
- teacher subscription;
- active learner allowance;
- intelligence processing allowance;
- premium modules.

### PRIME School — B2B

Multi-teacher, multi-learner institutional product.

The institution may retain its existing LMS/ERP/workspace while PRIME becomes an intelligence and action layer over authorized educational data.

Principle:

> **Keep your systems. Add the learning intelligence layer.**

Requires strong tenancy, roles, governance, auditability and data isolation.

### PRIME Enterprise / University — hypothesis

Potential institutional layer including:
- programs;
- SSO;
- institutional governance;
- integrations;
- configurable retention;
- analytics;
- custom Companion experiences;
- SLA and enterprise controls.

This is an exploration direction, not an MVP requirement.

## 7. Discipline and market expansion hypothesis

The architecture should not assume that PRIME is permanently limited to English.

Potential programs include:
- English and other languages;
- academic subjects;
- exam preparation;
- academic English;
- tourism/hospitality communication;
- corporate communication;
- study-abroad preparation;
- other instructor-led learning programs.

The reusable platform abstraction is:

```text
Learner
→ Learning Interaction
→ Evidence
→ Interpretation
→ Human Decision
→ Learning State
→ Action
→ Attempt
→ New Evidence
```

Pedagogical rules belong to the Program/Methodology layer.

## 8. In-person learning

In-person capture is strategically important.

A learning interaction should not require a scheduled online meeting to exist. Calendar identity is a valuable source of evidence, not the sole authority for lesson existence.

Potential sources may include authorized:
- Meet/Gemini artifacts;
- in-person transcripts;
- teacher notes;
- learner submissions;
- assessments;
- institutional sources.

Unscheduled or poorly diarized interactions must preserve uncertainty rather than fabricate speaker attribution or lesson identity.

## 9. Data and trust position

PRIME should not position itself as a system that “discovers a learner’s personality” from purchased or incidental data.

Institutional value should be framed as transforming **authorized educational data into useful continuity and action**.

Prefer defensible signals:
- observed learning behavior;
- demonstrated skills;
- teacher-validated evidence;
- learner-declared preferences;
- goals;
- attempts;
- engagement with assigned actions.

Sensitive or speculative psychological/personality inference is outside the current canonical thesis and requires separate governance/legal/product review before consideration.

## 10. Tenancy and authority direction

Future commercial distribution requires explicit isolation:

```text
Organization
    ↓
Instructor
    ↓
Learner
    ↓
Session
    ↓
Source / Attempt
```

Authority principles:
- AI → candidate only;
- authorized instructor → pedagogical review/decision;
- learner → own permitted data and attempts;
- school administrator → organization-scoped administration;
- platform administrator → platform operations, not automatic pedagogical authority.

Multi-tenancy must be designed before broad commercial rollout, even if the first operational slice remains single-organization.

## 11. What we will not build by default

PRIME should avoid:
- a mobile clone of the Student Dashboard;
- a generic flashcard app;
- a chatbot pretending to replace the teacher;
- artificial progress percentages without pedagogical authority;
- automatic claims of mastery from student attempts;
- gamification disconnected from learning purpose;
- automatic publication of AI interpretations;
- a Teacher app that merely reproduces the Admin Panel;
- premature Enterprise features before the core loop works.

## 12. Immediate product milestone

Do not build the entire platform surface at once.

Prove one complete vertical slice:

```text
REAL INTERACTION
→ Candidate
→ PRIME Teacher review
→ Teacher decision
→ Canonicalization
→ Authorized next action
→ PRIME Companion
→ Learner attempt
→ New candidate/evidence
→ Teacher review
```

Success criterion:

> A teacher can operate the pedagogical loop without opening GitHub, Vercel, Cloud Shell, database consoles or pipeline logs.

The Valeria in-person/unscheduled lesson is an important discovery witness for capture and Candidate generation, but it does not by itself prove the complete closed loop.

## 13. Product success test

Before broad commercialization, PRIME should demonstrate that a teacher can work through ordinary teaching days primarily through PRIME Teacher while learners receive meaningful between-session continuity through PRIME Companion.

The product wins when infrastructure becomes invisible and the system reliably answers:

**Teacher:** What needs me now?  
**Learner:** What should I do now?  
**Dashboard:** What does PRIME know, and why?  
**Intelligence:** What can be prepared without stealing human authority?

## 14. Exploration backlog — not canonical commitments

Ideas to refine:
- teacher mobile/PWA packaging;
- Companion white-labeling;
- school/university integrations;
- LMS/API/Sheets ingestion;
- configurable Program/Methodology contracts;
- multilingual and multi-subject modules;
- tourism/hospitality companions;
- corporate learning;
- pricing by seats, active learners and intelligence usage;
- marketplace/distribution possibilities;
- institutional analytics;
- notifications and action reminders;
- native apps after recurrence is proven.

## 15. Governance of this thesis

This file is the canonical **product discovery baseline**, not a technical implementation contract.

Changes should be classified as:
- **CANONICAL CORE** — settled product principle;
- **PRODUCT HYPOTHESIS** — plausible direction requiring validation;
- **EXPLORATION** — idea not yet authorized as roadmap.

Technical implementation belongs in architecture documents. Evidence that implementation works belongs in audit/checkpoint documents. Product decisions should be recorded separately in the Product Decision Log.

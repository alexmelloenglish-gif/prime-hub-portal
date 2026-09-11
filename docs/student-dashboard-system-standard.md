# PRIME DIGITAL HUB

## Student Dashboard System Standard

**Status:** Canonical product standard  
**Scope:** All student dashboards  
**Reference validation case:** Cláudio Bittencourt  
**Applies to:** existing students, future students, shared dashboard components and visual primitives

---

# 1. Purpose

The Prime Digital Hub student dashboard is a shared product system with individualized student content.

The dashboard must preserve the Prime pedagogical architecture while making learning state, priorities, evidence, next action and history easier to understand.

The governing sequence is:

> **STATE → PRIORITY → EVIDENCE → ACTION → HISTORY**

The product must feel like one coherent Prime system across all students, while each learner's actual learning story remains unique.

---

# 2. System Layer vs Student Layer

## System Layer

Shared across all dashboards:

- layout;
- spacing;
- typography;
- card treatment;
- badges;
- CTA hierarchy;
- responsive behavior;
- evidence-state presentation;
- development visualization;
- attendance presentation;
- progressive disclosure;
- section contrast and hierarchy.

## Student Layer

Must remain individualized:

- student name;
- current level;
- target level;
- objective;
- learning focus;
- evidence;
- validated observations;
- priorities;
- next action;
- class reports;
- attendance history;
- learner memory;
- projects;
- pedagogical interpretation.

Do not standardize away student-specific content. Standardize how that content is presented.

---

# 3. No Student-Specific UI Hacks

Do not implement:

- hard-coded spacing for a named student;
- fixed text lengths based on one student;
- special card heights for a particular profile;
- custom CTA behavior for one student;
- hard-coded CEFR transitions;
- student-specific CSS patches.

Cláudio is a validation case, not an exception.

Any shared improvement must work with:

- short and long names;
- different CEFR levels;
- different target levels;
- different text lengths;
- different priority counts;
- different report volumes;
- different attendance histories;
- different project names.

---

# 4. Canonical Dashboard Hierarchy

The dashboard should communicate, in this order:

1. **STATE** — Where am I?
2. **PRIORITY** — What matters now?
3. **EVIDENCE** — What supports this interpretation?
4. **ACTION** — What do I do next?
5. **HISTORY** — What has happened over time?

The visual hierarchy should make this sequence obvious before the user reads every detail.

---

# 5. Current State Standard

Current State must be a reusable shared component supporting:

- Current Level;
- Target Level;
- Objective;
- Learning Focus.

Requirements:

- consistent padding;
- predictable badge placement;
- balanced card proportions;
- strong primary text hierarchy;
- secondary copy with accessible contrast;
- controlled initial visual height for unusually long content;
- progressive disclosure where appropriate.

Important: controlled text length must not delete pedagogically important information. Long content may be collapsed or progressively disclosed, but not silently removed.

---

# 6. Development Trajectory Standard

The dashboard may show a qualitative development trajectory when supported by the student's data.

Examples:

- A2 → development → B1
- B1 → development → B2
- B2 → development → C1

Do not hard-code a single transition.

The component must support incomplete states, including:

- current level established;
- development focus established;
- target not yet validated.

Do not introduce artificial numerical precision such as:

- percentage complete;
- XP;
- points;
- gamified progress;
- progress bars implying unsupported measurement.

The dashboard should communicate pedagogical development, not invented quantification.

---

# 7. Evidence and Validation States

Evidence labels communicate authority, not decoration.

Canonical states may include:

- **Teacher Validated**
- **Portfolio Confirmed**
- **Qualified Insight**
- **Not Available**

The visual system must keep these distinctions consistent everywhere.

Never visually imply that unvalidated automated interpretation has the same authority as teacher validation.

---

# 8. Next Action Standard

Use one reusable Next Action pattern for all students.

Structure:

- **NEXT ACTION**
- student-specific action title;
- concise explanation of why it matters now;
- evidence or rationale when available;
- action CTA;
- schedule context when supported by data.

The presentation is standardized. The action remains student-specific.

Do not hard-code project names or student-specific CTA behavior.

---

# 9. Attendance Standard

Family-facing terminology must distinguish completed attendance from scheduled lessons.

Use:

- **attended lesson / attended lessons**
- **latest attended lesson**
- **schedule** when supported

Avoid using **confirmed lessons** to describe attendance because it may be confused with a booked or scheduled class.

Canonical semantic states:

- `scheduled` = booked / expected, not yet known to have happened;
- `attended` = lesson happened and student was present;
- `cancelled` = lesson did not happen;
- unknown historical state must not be silently converted.

Attendance components must display only metrics supported by the student's data.

Do not invent:

- attendance rates;
- absence trends;
- scheduled totals;
- completion percentages.

The Attendance Summary should gracefully support students with little or extensive attendance history.

---

# 10. RECENT vs LONGITUDINAL

These are different semantic layers and must remain visually and logically distinct.

## RECENT

Purpose: concise view of the latest bounded lesson evidence.

RECENT may be display-limited.

## LONGITUDINAL

Purpose: preserve complete published class-report history.

Published Class Reports must not be removed from the longitudinal view merely because newer reports exist.

New lessons must never push older published reports out of the full history.

---

# 11. MEMORY

Learner Memory is persistent useful context, not a duplicate of recent evidence or class reports.

It may include:

- cumulative skill observations;
- reusable vocabulary;
- grammar/language patterns;
- teacher feedback;
- useful historical memory.

MEMORY should remain visually distinct from RECENT and LONGITUDINAL.

---

# 12. Progressive Disclosure

The dashboard must follow three layers:

## First Layer

What the student or family needs to know immediately.

## Second Layer

Supporting evidence and explanation.

## Third Layer

Full historical detail.

Principle:

> **Prioritize visibility, not deletion.**

The dashboard may contain substantial history. Its job is to curate access to that history, not erase it.

---

# 13. Visual Contrast and Accessibility

Maintain the Prime identity:

- light background;
- navy primary typography;
- restrained secondary text;
- premium educational aesthetic.

Improve hierarchy through:

- stronger section contrast;
- slightly darker secondary text where needed;
- clearer card borders;
- more obvious CTA hierarchy;
- restrained but distinct semantic surface treatments;
- consistent spacing;
- predictable badge placement.

Do not solve hierarchy problems by adding unnecessary saturation or decorative charts.

Suggested semantic distinction:

- NOW: strongest functional priority;
- RECENT: restrained blue treatment;
- LONGITUDINAL: restrained violet treatment;
- MEMORY: muted slate/violet treatment;
- ATTENDANCE: restrained emerald treatment;
- NEXT ACTION: strong navy treatment.

---

# 14. Responsive Behavior

Shared components must remain stable across:

- desktop;
- laptop;
- narrow viewport;
- approximately 125% browser zoom.

Validate both:

- short-content students;
- high-content students.

Look for:

- overflow;
- broken wrapping;
- excessive card height;
- badge collisions;
- CTA displacement;
- long-name failure;
- long-learning-focus failure;
- inconsistent proportions.

---

# 15. Cross-Student QA

Before declaring a shared dashboard refinement complete, inspect at least:

- Cláudio;
- Rafael;
- Ítalo;
- Gustavo;
- one representative short-content or future-profile case.

Check:

- card proportions;
- spacing;
- typography;
- badge treatment;
- CTA hierarchy;
- section spacing;
- responsive behavior;
- evidence labels;
- CEFR transition flexibility;
- report-volume flexibility;
- attendance flexibility.

If a component works only for one student, it is not finished.

---

# 16. Scope Control

This standard does not authorize changes to:

- database structures;
- evidence pipeline architecture;
- student pedagogical content;
- teacher judgments;
- new metrics;
- gamification;
- decorative charts;
- backend rules;
- student-specific hacks.

If a visual improvement requires new backend data or a new pedagogical rule, flag it separately.

---

# 17. Canonical Publish Principle

Dashboard and portfolio are projections of the same canonical learning evidence.

The preferred system flow is:

> class → transcript/source artifact → evidence extraction → canonical lesson → portfolio projection → dashboard projection → consistency validation → production

A dashboard must never silently manufacture evidence to complete its presentation.

---

# 18. Regression Protection

Self-tests and validators should protect the following invariants:

- shared visual primitives remain student-agnostic;
- no named-student UI logic is introduced;
- attendance language remains semantically correct;
- full longitudinal published report history remains preserved;
- evidence authority remains explicit;
- artificial CEFR percentages are not introduced;
- canonical hierarchy remains intact;
- historical unknowns are warnings until evidence resolves them, not silently rewritten facts.

---

# 19. Acceptance Criteria

For any student dashboard, the user should be able to identify quickly:

1. **WHERE AM I?** — Current level.
2. **WHERE AM I GOING?** — Target level when validated.
3. **WHAT MATTERS NOW?** — Current learning priorities.
4. **WHAT IS THE EVIDENCE?** — Portfolio, class reports, teacher validation or qualified evidence state.
5. **WHAT DO I DO NEXT?** — Recommended next action.

This must remain true regardless of name length, level, content volume, report count, project type or attendance history.

---

# 20. Governing Principle

**Cláudio is the test case.**  
**The dashboard system is the product.**

The objective is not to make one student's dashboard look better.

The objective is to make every Prime student dashboard communicate the same high-quality pedagogical architecture more clearly while preserving each learner's unique story.

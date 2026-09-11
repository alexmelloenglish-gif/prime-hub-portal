# PRIME DIGITAL HUB

## PRIME Progress Tracker — Frozen Standard

**Status:** FROZEN / CANONICAL  
**Scope:** every existing and future student dashboard  
**Applies to:** learner-facing Progress Tracker states, labels, meanings, colors and normalization

---

## Canonical states

The PRIME Progress Tracker has exactly four learner-facing states. No synonyms or dashboard-specific variants are permitted.

| State | Color | Meaning |
|---|---|---|
| **Strong** | Green / emerald | The skill is demonstrated consistently. |
| **Improving** | Blue | The skill is showing active, observable development. |
| **Needs Focus** | Amber | The skill requires targeted attention and practice. |
| **Not Assessed** | Neutral gray / slate | There is not yet enough evidence to classify the skill. |

The canonical order is:

> **Strong → Improving → Needs Focus → Not Assessed**

`Not Assessed` is neutral. It is not a negative judgment and must never be styled as failure.

---

## Legacy normalization

Legacy or alternative labels must normalize before learner-facing rendering:

- `Very Strong` → **Strong**
- `Secure` → **Strong**
- `Established` → **Strong**
- `Active Growth` → **Improving**
- `Developing` → **Improving**
- `Progressing` → **Improving**
- `On Track` / `on-track` → **Improving**
- `Needs Attention` → **Needs Focus**
- `Attention` → **Needs Focus**
- `Priority` → **Needs Focus**
- `Needs Practice` → **Needs Focus**
- `Pending` / `Unknown` / `Not Available` / `Not Yet Assessed` → **Not Assessed**

Any unrecognized state must render as **Not Assessed**, because the dashboard must not manufacture a pedagogical judgment when the evidence state is unclear.

---

## Visual contract

The color semantics are fixed globally:

- **Strong:** emerald / green
- **Improving:** blue
- **Needs Focus:** amber
- **Not Assessed:** neutral slate / gray

Color is supplemental to the text label. The exact state name must always remain visible so meaning does not depend on color perception alone.

Red is not part of the normal learner-progress taxonomy. It is reserved for genuinely critical/error states outside this progress system.

---

## No pseudo-quantification

The Progress Tracker is qualitative. Do not infer or display:

- percentage completion;
- arbitrary progress-bar widths;
- points;
- XP;
- scores manufactured from the four states;
- a mathematical distance from one state to another.

The underlying evidence and teacher interpretation remain the authority.

---

## System implementation rule

The four-state taxonomy belongs to the shared dashboard system, not individual student profiles.

All dashboard renderers must pass raw/legacy status labels through the shared normalization function before presentation. This guarantees that older records remain compatible while every learner sees the same four-state vocabulary.

New student data should use only the four canonical labels.

---

## Freeze rule

Do not add a fifth learner-facing progress state or introduce a synonym without explicitly reopening this frozen product standard.

> **PRIME Progress States: Strong / Improving / Needs Focus / Not Assessed.**
>
> Same four states. Same names. Same meanings. Same colors. Same hierarchy. Every student dashboard.

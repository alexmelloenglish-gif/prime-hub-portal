# Cláudio Bittencourt — Full Historical Evidence Register

**Date:** 2026-09-21  
**StudentId:** `stu_e22a6c379329`  
**Purpose:** consolidate everything currently recoverable about Cláudio without collapsing raw source, authorized historical report, process provenance and memory into one evidence class.

## Evidence classes

```text
PRIMARY SOURCE
> strongest source-level replay authority

AUTHORIZED HISTORICAL REPORT
> prior teacher-authorized learning history; usable as historical state,
  but not a substitute for missing raw transcript

PROCESS PROVENANCE
> proves a file/process event existed; does not by itself prove lesson content

MEMORY
> preserves known longitudinal thread without attendance/content inflation

EXCLUDED
> synthetic/non-pedagogical artifacts
```

---

## 1. 02 Mar 2026 — Birthday / zodiac / personal conversation

### Current evidence
- canonical lesson record: `confirmed_20260302_claudio`
- sourceType: `read_ai_meeting_record`
- prior status: authoritative learning evidence / published
- historical report summary: personalized conversation around Cláudio's birthday and the twelve zodiac signs
- focus preserved:
  - personal conversation;
  - descriptive vocabulary;
  - zodiac vocabulary;
  - spontaneous interaction.

### Evidence class
**AUTHORIZED HISTORICAL REPORT**

### Primary-source status
**NOT RECOVERED**

### Rule
Keep the lesson and its previously authorized history in the longitudinal record. Do not pretend the original Read.ai transcript was recovered.

---

## 2. 13 Jul 2026 — Technology / AI / scuba diving

### Current evidence
- canonical lesson record: `confirmed_20260713_claudio`
- sourceType: `tactiq_transcript`
- sourceDocumentId: `1cXzSXJwoNyE_AxrKPJcPUg2cMNN8YLRY6kRwxxraBLA`
- prior status: authoritative learning evidence / published
- historical report summary:
  - technology and AI;
  - World Cup/teamwork;
  - diving safety;
  - dive computers;
  - robotic diving;
  - innovation.
- preserved vocabulary:
  - eager team;
  - security margin;
  - depth;
  - dive computer;
  - diving safety;
  - robotic diving.

### Evidence class
**AUTHORIZED HISTORICAL REPORT + SOURCE REFERENCE**

### Primary-source status
**RAW CONTENT NOT RECOVERED**

Search performed across:
- current GitHub;
- GitHub history;
- ChatGPT Library/conversation files;
- Neon transcript store;
- Neon pipeline events;
- direct public URL access attempt.

No raw body was recovered in this run.

### Rule
Keep the previously authorized July learning history. Do not generate new sentence-level evidence from the old report alone.

---

## 3. 17 Aug 2026 — Health / technology / aviation / economics / diving

### Primary source
- Google source document: `1qkRNcs9-jUkT01Jmw_LiJi3iLpvVTplQwSikEMjh0qw`
- Neon transcript: `cmtcalwpt000219r457hlsba9`
- length: 93,426 characters
- identityVerified: true
- attendance input: attended
- triage: usable transcript
- source name:
  `🇬🇧 CLAUDIO BITTENCOURT | Conversation Class - 2026/08/17 19:48 GMT-03:00 - Anotações do Gemini`

### Historical old-pipeline result
- run: `cmtcalwp3000019r4s10h2kn6`
- status: failed
- error: Gemini HTTP 403
- authority: non_authoritative

### Evidence class
**PRIMARY SOURCE**

### Confrontation against old published report

Old report claimed:
- health vocabulary;
- authentic listening;
- aviation;
- economics/logistics;
- opinion/comparison;
- diving;
- critical thinking / conversational stamina;
- vocabulary including active ingredient, side effects, blood sugar, liver, appetite, gradual reduction, investment, cost, logistics, aircraft, helicopter, cylinders.

The recovered raw source supports the broad topic map and long-form reasoning pattern. It also supports the source-level origin of the later diving-destination project.

### Important correction
The raw source also shows frequent Portuguese/English code-switching and substantial teacher support in places. Therefore old broad learner-facing claims must be interpreted with condition boundaries rather than as uniform independent English performance.

### Current vNext replay
Recorded separately in:
`docs/architecture/machine-results/CLAUDIO-NEW-MACHINE-SOURCE-REPLAY-2026-09-21.md`

---

## 4. Earlier 8K television / World Cup lesson

### Evidence
The exact original source/date is not recovered.

However, the 17 Aug primary source explicitly returns to that earlier shared topic, confirming that the historical thread existed.

### Evidence class
**MEMORY ONLY**

### Allowed use
- preserve the existence of a prior learning/content thread;
- use it as a candidate for delayed retrieval verification.

### Forbidden use
- count attendance;
- invent exact date;
- recreate original learner performance;
- claim independent delayed recall when the 17 Aug return was teacher-cued.

---

## 5. Processados / Drive provenance

Historical handoff evidence states that files for **Gustavo, Cláudio and Eduarda** were manually processed and moved to a folder named `Processados`.

Known folder identity:
- `Processados`: `1omPN8i31cwFeBLzEyQ5yOKnbmhMnhnO7`

Historical Meet Recordings inventory:
- old folder: `1p7u86xfGCRkbSBiNgSZMnUNO5j4S5vMw`

Current configured root in reconciliation code:
- `1LipcZbo-LNgCNOvjYzFpOzecOf4byDGL`

The persisted 17 Aug Cláudio transcript carries the old Meet Recordings folder id in metadata.

### Interpretation
This is useful **process provenance**, especially because the 17 Aug snapshot of Meet Recordings happened before Cláudio's evening class transcript existed.

It does not establish an additional lesson beyond the evidence already recovered.

---

## 6. Synthetic test — 28 Aug 2026

Source:
`CLAUDIO BITTENCOURT | SYNTHETIC TEST TRANSCRIPT | NOT A REAL CLASS`

### Evidence class
**EXCLUDED**

Never use it for:
- attendance;
- learning state;
- Portfolio;
- vocabulary;
- memory;
- progress;
- Dashboard.

---

## 7. Name search / Library findings

Exact-name search recovered operational records, not new transcripts:
- `PRIME_Student_Master_Improved_2026-09-11.xlsx`
- `Prime Master System Pro 3.0 (1).html`

Useful confirmed operational facts include:
- Cláudio email: `claudio.bit@gmail.com`
- weekly Monday 19:30 slot;
- live Meet: `https://meet.google.com/zbz-uiai-xng`
- portfolio: `1Drg6EnGyYF46neAxIaaa_BX2OE4Fb9CErbwRH1bczFc`

No Library file title containing Claudio/Cláudio/Bittencourt was returned as a transcript.

---

# Consolidated historical model

The current history should therefore be represented as:

```text
02 Mar
AUTHORIZED HISTORICAL LESSON
raw source pending

13 Jul
AUTHORIZED HISTORICAL LESSON
source ID known
raw source pending

17 Aug
PRIMARY SOURCE RECOVERED
new-machine replay available

Undated 8K / World Cup
MEMORY ONLY
original source/date pending

28 Aug synthetic
EXCLUDED
```

This is more complete than either extreme:
- throwing away March/July because their raw transcripts are not currently retrievable;
- or pretending the old reports are themselves raw transcripts.

The machine must preserve both the **history** and the **evidence class** of that history.

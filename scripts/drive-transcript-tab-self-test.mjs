import assert from 'node:assert/strict'
import { extractGoogleDocsTranscript } from '../lib/google-docs-transcript-extraction.ts'

function paragraph(text) {
  return {
    paragraph: {
      elements: [{ textRun: { content: text } }],
    },
  }
}

const englishTabbedDoc = {
  tabs: [
    {
      tabProperties: { tabId: 'quick', title: 'Quick notes' },
      documentTab: { body: { content: [paragraph('NOTE ONLY — MUST NOT ENTER EVIDENCE')] } },
    },
    {
      tabProperties: { tabId: 'full', title: 'Full notes' },
      documentTab: { body: { content: [paragraph('SUMMARY ONLY — MUST NOT ENTER EVIDENCE')] } },
    },
    {
      tabProperties: { tabId: 'transcript', title: 'Transcript' },
      documentTab: { body: { content: [paragraph('Louise Nogueira: real transcript evidence')] } },
    },
  ],
}

const portugueseTabbedDoc = {
  tabs: [
    {
      tabProperties: { tabId: 'notes', title: 'Observações' },
      documentTab: { body: { content: [paragraph('RESUMO — NAO E TRANSCRICAO')] } },
    },
    {
      tabProperties: { tabId: 'transcript', title: 'Transcrição' },
      documentTab: { body: { content: [paragraph('Gustavo: evidencia real da transcrição')] } },
    },
  ],
}

const english = extractGoogleDocsTranscript(englishTabbedDoc)
assert.equal(english.text, 'Louise Nogueira: real transcript evidence')
assert.equal(english.extractionMode, 'google_docs_transcript_tab_v1')
assert.equal(english.sourceTabId, 'transcript')
assert.equal(english.sourceTabTitle, 'Transcript')
assert.doesNotMatch(english.text, /NOTE ONLY|SUMMARY ONLY/)

const portuguese = extractGoogleDocsTranscript(portugueseTabbedDoc)
assert.equal(portuguese.text, 'Gustavo: evidencia real da transcrição')
assert.equal(portuguese.extractionMode, 'google_docs_transcript_tab_v1')
assert.equal(portuguese.sourceTabId, 'transcript')
assert.equal(portuguese.sourceTabTitle, 'Transcrição')
assert.doesNotMatch(portuguese.text, /RESUMO/)

assert.throws(
  () => extractGoogleDocsTranscript({
    tabs: [{
      tabProperties: { tabId: 'notes-only', title: 'Full notes' },
      documentTab: { body: { content: [paragraph('notes')] } },
    }],
  }),
  /drive_transcript_tab_missing/,
)

assert.throws(
  () => extractGoogleDocsTranscript({
    tabs: [
      {
        tabProperties: { tabId: 't1', title: 'Transcript' },
        documentTab: { body: { content: [paragraph('first')] } },
      },
      {
        tabProperties: { tabId: 't2', title: 'Transcrição' },
        documentTab: { body: { content: [paragraph('second')] } },
      },
    ],
  }),
  /drive_transcript_tab_ambiguous/,
)

const legacy = extractGoogleDocsTranscript({ body: { content: [paragraph('legacy transcript body')] } })
assert.equal(legacy.text, 'legacy transcript body')
assert.equal(legacy.extractionMode, 'google_docs_legacy_single_body_v1')
assert.equal(legacy.sourceTabId, null)
assert.equal(legacy.sourceTabTitle, null)

console.log('Drive transcript-tab-only self-test: PASS')

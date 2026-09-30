import assert from 'node:assert/strict'
import { extractGoogleDocsTranscript } from '../lib/drive-reconciliation.ts'

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
assert.equal(english, 'Louise Nogueira: real transcript evidence')
assert.doesNotMatch(english, /NOTE ONLY|SUMMARY ONLY/)

const portuguese = extractGoogleDocsTranscript(portugueseTabbedDoc)
assert.equal(portuguese, 'Gustavo: evidencia real da transcrição')
assert.doesNotMatch(portuguese, /RESUMO/)

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

assert.equal(
  extractGoogleDocsTranscript({ body: { content: [paragraph('legacy transcript body')] } }),
  'legacy transcript body',
)

console.log('Drive transcript-tab-only self-test: PASS')

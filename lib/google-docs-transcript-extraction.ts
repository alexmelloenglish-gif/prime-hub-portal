export type GoogleDocsStructuralElement = {
  textRun?: { content?: string }
  paragraph?: { elements?: GoogleDocsStructuralElement[] }
  table?: { tableRows?: Array<{ tableCells?: Array<{ content?: GoogleDocsStructuralElement[] }> }> }
}

type GoogleDocsTab = {
  title?: string
  tabId?: string
  tabProperties?: { title?: string; tabId?: string }
  documentTab?: { body?: { content?: GoogleDocsStructuralElement[] } }
  childTabs?: GoogleDocsTab[]
}

export type GoogleDocsTranscriptExtraction = {
  text: string
  extractionMode: 'google_docs_transcript_tab_v1' | 'google_docs_legacy_single_body_v1'
  sourceTabId: string | null
  sourceTabTitle: string | null
}

function normalizeTabTitle(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function extractDocsElements(elements: GoogleDocsStructuralElement[] | undefined): string {
  if (!elements) return ''
  return elements.map((element) => {
    if (element.textRun?.content) return element.textRun.content
    if (element.paragraph?.elements) return extractDocsElements(element.paragraph.elements)
    if (element.table?.tableRows) {
      return element.table.tableRows
        .flatMap((row) => row.tableCells || [])
        .map((cell) => extractDocsElements(cell.content))
        .join('')
    }
    return ''
  }).join('')
}

function flattenGoogleDocsTabs(tabs: GoogleDocsTab[] | undefined): GoogleDocsTab[] {
  if (!tabs) return []
  return tabs.flatMap((tab) => [tab, ...flattenGoogleDocsTabs(tab.childTabs)])
}

function isTranscriptTabTitle(title: string | undefined): boolean {
  const normalized = normalizeTabTitle(title || '')
  return normalized === 'transcript' || normalized === 'transcricao'
}

export function extractGoogleDocsTranscript(document: unknown): GoogleDocsTranscriptExtraction {
  if (!document || typeof document !== 'object' || Array.isArray(document)) {
    return {
      text: '',
      extractionMode: 'google_docs_legacy_single_body_v1',
      sourceTabId: null,
      sourceTabTitle: null,
    }
  }

  const root = document as {
    body?: { content?: GoogleDocsStructuralElement[] }
    tabs?: GoogleDocsTab[]
  }

  const tabs = flattenGoogleDocsTabs(root.tabs)
  if (tabs.length) {
    const transcriptTabs = tabs.filter((tab) =>
      isTranscriptTabTitle(tab.tabProperties?.title || tab.title)
    )

    if (transcriptTabs.length !== 1) {
      throw new Error(
        transcriptTabs.length === 0
          ? 'drive_transcript_tab_missing'
          : 'drive_transcript_tab_ambiguous'
      )
    }

    const transcriptTab = transcriptTabs[0]
    const transcript = extractDocsElements(transcriptTab.documentTab?.body?.content)
    if (!transcript.trim()) throw new Error('drive_transcript_tab_empty')

    return {
      text: transcript,
      extractionMode: 'google_docs_transcript_tab_v1',
      sourceTabId: transcriptTab.tabProperties?.tabId || transcriptTab.tabId || null,
      sourceTabTitle: transcriptTab.tabProperties?.title || transcriptTab.title || null,
    }
  }

  return {
    text: extractDocsElements(root.body?.content),
    extractionMode: 'google_docs_legacy_single_body_v1',
    sourceTabId: null,
    sourceTabTitle: null,
  }
}

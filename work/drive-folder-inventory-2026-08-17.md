# Drive folder inventory — Meet Recordings

Folder: https://drive.google.com/drive/u/0/folders/1p7u86xfGCRkbSBiNgSZMnUNO5j4S5vMw
Observed through authenticated My Browser on 2026-08-17.

The folder is titled `Meet Recordings` under `My Drive` and is shared. The visible list contains five Google Docs-style transcript files:

1. `GB RAFAEL COPOLILLO | Prime Digital Hub - 2026/08/...` — modified 13 Aug; size 4 KB.
2. `LOUISE D. SILVA NOGUEIRA - 2026/08/10 08:18 GMT-...` — modified 16 Aug; size 34 KB.
3. `LOUISE D. SILVA NOGUEIRA - 2026/08/17 00:09 GMT-...` — modified 00:13; size 4 KB.
4. `Reunião iniciada às 2026/08/16 23:15 GMT-03:00 - An...` — modified 00:08; size 5 KB.
5. `Reunião iniciada às 2026/08/16 23:15 GMT-03:00 - An...` — modified 00:08; size 4 KB.

The folder currently appears to contain both identifiable student transcripts and two ambiguous meeting files. The two ambiguous files cannot be routed safely from filename alone. The exact file IDs, full names, content, and ownership/modified metadata still need to be retrieved through Drive API/Flow or by opening each file. No files were moved, renamed, deleted, or edited.

Operational implication: a Google Flow trigger may detect the folder, but the routing step must require an approved identity mapping and should create a blocked/identity-review item for ambiguous meeting files instead of submitting them as Rafael or Louise.

## Refined visible metadata from the Drive page

The full visible titles are:

1. `🇬🇧 RAFAEL COPOLILLO | Prime Digital Hub - 2026/08/13 08:58 GMT-03:00 - Anotações do Gemini` — shared, owner shown as `eu`, modified 13 Aug, 4 KB.
2. `LOUISE D. SILVA NOGUEIRA - 2026/08/10 08:18 GMT-03:00 - Anotações do Gemini` — shared, owner `eu`, modified 16 Aug, 34 KB.
3. `LOUISE D. SILVA NOGUEIRA - 2026/08/17 00:09 GMT-03:00 - Anotações do Gemini` — shared, owner `eu`, modified 00:13, 4 KB.
4. `Reunião iniciada às 2026/08/16 23:15 GMT-03:00 - Anotações do Gemini (Inglês)` — shared, owner `eu`, modified 00:08, 5 KB.
5. `Reunião iniciada às 2026/08/16 23:15 GMT-03:00 - Anotações do Gemini (Português)` — shared, owner `eu`, modified 00:08, 4 KB.

The folder is visibly authenticated and accessible through the user’s Google session. The first three files have explicit student-name signals but still require an approved mapping to canonical student IDs/emails. The last two files are ambiguous because their names contain only a meeting timestamp and language; they must be blocked for identity review rather than routed automatically.

## Rafael transcript document URL

Selected Rafael file resolves to Google Doc:
`https://docs.google.com/document/d/1vvn8PrEfPH-JAp8vNLRpdFbPeKVQyLYdYeoKkPIvNeY/edit?tab=t.ujp6tjazfy63`

The authenticated account shown in the Google UI is `PRIME DIGITAL HUB (alexandre@primedigitalhub.com.br)`. Navigation from Drive to the Doc remained in the Drive SPA in the connected browser, so the transcript body has not yet been extracted; only the file title and document URL are verified.

## Rafael Google Doc visual confirmation

Source: Google Docs document `1vvn8PrEfPH-JAp8vNLRpdFbPeKVQyLYdYeoKkPIvNeY`.

Visible document facts:
- Title: `🇬🇧 RAFAEL COPOLILLO | Prime Digital Hub`.
- Date marker: `Aug 13, 2026`.
- Invited participant: `rafael.copolillo@gmail.com`.
- The document shows an attachment named `GB RAFAEL COPOLILLO | Prime Digital Hub`.
- It shows a meeting record chip named `Transcript`.
- The document contains visible sections/tabs `📝 Notes` and `📖 Transcript`, and a `Summary` heading is visible below the header.
- The active Google account is `alexandre@primedigitalhub.com.br`.

The document body is rendered in the Docs canvas; the browser's extracted markdown exposes the header/navigation but not the canvas text. This confirms provenance and identity, but not yet the full transcript text.

## Rafael transcript tab content

Clicking the `📖 Transcript` document tab changed the title to `GB RAFAEL COPOLILLO | Prime Digital Hub - Transcript`. The visible transcript begins with duration `00:01:09` and the first visible speaker line is `PRIME DIGITAL HUB: Yes. You hear something?`.

This is a very short transcript (1 minute 9 seconds), which is important for pipeline testing: it may be a technical/audio check rather than a full pedagogical lesson. It must not be treated as a complete class report without review.

## Rafael transcript duration clarification

After selecting the Transcript tab and pressing PageDown, the document view shows the transcript ending after `00:33:01` (the earlier `00:01:09` was a visible timestamp at the beginning of the transcript, not the total meeting duration). The document also displays the warning: `This editable transcript was computer generated and might contain errors. People can also change the text after it was created.`

This confirms a substantial transcript exists and that human verification is required before AI processing or publication.

## Drive API inventory (authenticated Google Workspace account)

The folder `1p7u86xfGCRkbSBiNgSZMnUNO5j4S5vMw` contains five Google Docs, all with MIME type `application/vnd.google-apps.document`:

| Document ID | Name | Modified (UTC) | Size | Role for routing |
|---|---|---|---:|---|
| `1hjR9LNlRVPY0dcN8TqjCEeWBT1Wf7mXpIcpjtsOR908` | `LOUISE D. SILVA NOGUEIRA - 2026/08/17 00:09 GMT-03:00 - Anotações do Gemini` | 2026-08-17 03:13:37 | 3,909 | Latest Louise document; needs transcript/content review |
| `19sQgStjblysXePe5sj0yAO0SUUScJjhGCv0vnx7dkRU` | `Reunião iniciada às 2026/08/16 23:15 GMT-03:00 - Anotações do Gemini (Inglês)` | 2026-08-17 03:08:59 | 4,977 | Identity not explicit in filename; must be quarantined until routed |
| `1WVcfsCICJt6J5cOjRTKW9mZDzark0PdaTKXy4OTIxGI` | `Reunião iniciada às 2026/08/16 23:15 GMT-03:00 - Anotações do Gemini (Português)` | 2026-08-17 03:08:54 | 3,812 | Identity not explicit in filename; must be quarantined until routed |
| `102fKHv_pC4eT9K8xanOJdET23PrWOz2fv9wRTZrlC94` | `LOUISE D. SILVA NOGUEIRA - 2026/08/10 08:18 GMT-03:00 - Anotações do Gemini` | 2026-08-17 02:25:02 | 35,017 | Existing Louise transcript/source document |
| `1vvn8PrEfPH-JAp8vNLRpdFbPeKVQyLYdYeoKkPIvNeY` | `🇬🇧 RAFAEL COPOLILLO | Prime Digital Hub - 2026/08/13 08:58 GMT-03:00 - Anotações do Gemini` | 2026-08-13 12:35:43 | 4,049 | Rafael transcript/source document |

Source: authenticated Google Drive API listing executed on 2026-08-17 for the user-provided folder link. No files were modified.

## Google Docs API extraction

The latest Louise document `1hjR9LNlRVPY0dcN8TqjCEeWBT1Wf7mXpIcpjtsOR908` was retrieved through the authenticated Google Docs API into `work/gws_louise_latest.json` on 2026-08-17. The structured response is 36,197 bytes and is preserved locally for text extraction and routing analysis. No source document was modified.

## Louise latest document content

The latest Louise file `1hjR9LNlRVPY0dcN8TqjCEeWBT1Wf7mXpIcpjtsOR908` contains only the title/identity header and a Gemini-generated notice stating: `O resumo desta reunião não foi gerado porque não havia conversas suficientes em um idioma aceito.` It also says that, if transcribed, the transcript can be reviewed in the meeting records section. No summary, next steps, details, or transcript text was present in the retrieved document body.

Routing decision: this file must not be automatically processed as a complete lesson. It requires either a linked transcript export/record or human review to confirm that usable speech exists.

## API discrepancy for the 2026-08-16 English document

The Google Docs API returned `Requested entity was not found` for document `19sQgStjblysXePe5sj0yAO0SUUScJjhGCv0vnx7dkRU`, although the authenticated Drive API confirms that it exists, is a Google Doc, is not trashed, and is owned by `alexandre@primedigitalhub.com.br`. This is an API/content-access discrepancy, not evidence that the file is absent. The document is quarantined from automatic processing until readable content can be retrieved.

The Portuguese counterpart `1WVcfsCICtJ6J5cOjRTKW9mZDzark0PdaTKXy4OTIxGI` shows the same inconsistency: it appears in the authenticated folder listing, but both `gws docs documents get` and `gws drive files get` return `404 File not found`. It remains unprocessed and must be resolved or manually routed before any automation treats the 2026-08-16 bilingual pair as a valid lesson source.

## Louise 2026-08-10 document content

The Google Docs API successfully extracted the Louise document `102fKHv_pC4eT9K8xanOJdET23PrWOz2fv9wRTZrlC94`. It contains a full Gemini meeting-notes document with Louise identified by name and a long topical transcript/summary. The visible extracted content reaches at least `00:56:22` and includes English-learning discussion topics such as politics, inclusion, inequality, public safety, cost of living, independence, cultural events, transport, and Rock in Rio.

Routing decision: this is a viable transcript candidate, but it still requires the canonical Prompt 1 identity/evidence review. Its topical content also makes it important that the teacher confirm which portions are pedagogically relevant before any student-facing artifact is proposed.

## Rafael 2026-08-13 document content

The Google Docs API successfully extracted the Rafael document `1vvn8PrEfPH-JAp8vNLRpdFbPeKVQyLYdYeoKkPIvNeY`. It contains the identity header and Gemini meeting-notes shell, but states: `A summary wasn't produced for this meeting because there wasn't enough conversation in a supported language.` It also says that, if transcribed, the transcript can be reviewed in the meeting records section. No substantive transcript text was present in the retrieved document body.

Routing decision: this file is not sufficient by itself for automatic Prompt 1 processing. The linked meeting-record/transcript artifact must be retrieved or the file must be reviewed manually.

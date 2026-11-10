import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const trackedFiles = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT }).toString().split('\0').filter(Boolean)

const categories = {
  student_snapshots: (file) => /^data\/students\/.*\.json$/i.test(file),
  student_portfolios: (file) => /^docs\/student-portfolios\//i.test(file),
  forensic_snapshots: (file) => /^docs\/PRIME_(FORENSIC|RUNTIME_VERIFICATION|GL003)/i.test(file),
  audio_or_media: (file) => /(^|\/)(audio|recordings?|media)(\/|\.|$)/i.test(file),
  exports_or_fixtures: (file) => /(^|\/)(export|exports|fixture|fixtures|snapshot|snapshots)(\/|\.|$)/i.test(file),
}

const counts = Object.fromEntries(Object.keys(categories).map((key) => [key, 0]))
const matches = Object.fromEntries(Object.keys(categories).map((key) => [key, []]))

for (const relative of trackedFiles) {
  for (const [category, predicate] of Object.entries(categories)) {
    if (predicate(relative)) {
      counts[category] += 1
      matches[category].push(relative)
    }
  }
}

const contentCandidates = []
const sensitivePatterns = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /docs\.google\.com\/(?:document|spreadsheets|file)\/d\//i,
]

for (const relative of trackedFiles) {
  const absolute = path.join(ROOT, relative)
  let content
  try {
    content = fs.readFileSync(absolute, 'utf8')
  } catch {
    continue
  }
  if (sensitivePatterns.some((pattern) => pattern.test(content))) contentCandidates.push(relative)
}

const report = {
  generatedAt: new Date().toISOString(),
  trackedFileCount: trackedFiles.length,
  categories: counts,
  contentCandidateFileCount: contentCandidates.length,
  scanScope: {
    input: 'git ls-files tracked files in the current checkout',
    pathClassification: 'known path patterns only',
    contentPatterns: ['email-like strings', 'Google Docs document/spreadsheet/file URLs'],
    limitations: 'not comprehensive PII/DLP; does not inspect database, remote storage, audio, images, PDFs, untracked files, Git history, or external transcripts; unreadable files are skipped',
  },
  note: 'Output contains counts and categories only; matched values and file paths are not emitted.',
}

console.log(JSON.stringify(report, null, 2))

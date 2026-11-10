import { execFileSync } from 'node:child_process'

const output = execFileSync('node', ['scripts/privacy-inventory.mjs'], { encoding: 'utf8' })
const report = JSON.parse(output)

if (!Number.isInteger(report.trackedFileCount) || report.trackedFileCount <= 0) {
  throw new Error('Privacy inventory must scan tracked files')
}
if (report.scanScope?.input !== 'git ls-files tracked files in the current checkout') {
  throw new Error('Privacy inventory must disclose its tracked-file input scope')
}
if (!Array.isArray(report.scanScope?.contentPatterns) || report.scanScope.contentPatterns.length !== 2) {
  throw new Error('Privacy inventory must disclose the exact limited content patterns')
}
if (!/not comprehensive PII\/DLP/i.test(report.scanScope?.limitations || '')) {
  throw new Error('Privacy inventory must disclose that it is not comprehensive PII/DLP')
}
if (!Number.isInteger(report.contentCandidateFileCount) || report.contentCandidateFileCount < 0) {
  throw new Error('Privacy inventory must report a non-negative candidate count')
}
if (/@[a-z0-9.-]+\.[a-z]{2,}/i.test(output)) {
  throw new Error('Privacy inventory output must not contain email-like values')
}
if (/docs\.google\.com\/(?:document|spreadsheets|file)\/d\//i.test(output)) {
  throw new Error('Privacy inventory output must not contain document URLs')
}

console.log(`Privacy inventory self-test: PASS (${report.trackedFileCount} tracked files; bounded scan scope disclosed; no matched values emitted)`)

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const result = spawnSync(npm, ['audit', '--omit=dev', '--json', '--audit-level=high'], {
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024,
  env: { ...process.env, npm_config_audit: 'true' },
})

function parseAuditJson(output) {
  const start = output.indexOf('{')
  if (start < 0) return null
  try { return JSON.parse(output.slice(start)) } catch { return null }
}

const audit = parseAuditJson(result.stdout || '')
const lines = [
  '# PRIME Engine — Production Dependency Audit',
  '',
  '- Generated: ' + new Date().toISOString(),
  '- Command: npm audit --omit=dev --json --audit-level=high',
  '- Scope: production dependency graph only; development tooling is excluded.',
  '',
]

if (!audit || !audit.metadata || !audit.metadata.vulnerabilities) {
  lines.push('## Result', '', '**UNAVAILABLE** — npm did not return a parseable audit payload.', '')
  if (result.stderr && result.stderr.trim()) lines.push('### stderr', '', '---', result.stderr.trim(), '---', '')
  if (result.stdout && result.stdout.trim()) lines.push('### stdout', '', '---', result.stdout.trim().slice(0, 12000), '---', '')
  const report = lines.join('\n') + '\n'
  fs.mkdirSync(path.join(process.cwd(), 'artifacts'), { recursive: true })
  fs.writeFileSync(path.join(process.cwd(), 'artifacts/prime-dependency-audit.md'), report)
  process.stdout.write(report)
  process.exit(2)
}

const counts = audit.metadata.vulnerabilities
const total = ['info', 'low', 'moderate', 'high', 'critical'].reduce((sum, key) => sum + (counts[key] || 0), 0)
lines.push(
  '## Summary', '',
  '| Severity | Count |',
  '|---|---:|',
  ...['critical', 'high', 'moderate', 'low', 'info'].map((severity) => '| ' + severity + ' | ' + (counts[severity] || 0) + ' |'),
  '| **Total** | **' + total + '** |',
  '',
  '## Vulnerable production packages', '',
  '| Package | Severity | Direct | Installed range | Fix available | Advisory |',
  '|---|---|---:|---|---|---|',
)

const rank = { critical: 0, high: 1, moderate: 2, low: 3, info: 4 }
const vulnerabilities = Object.entries(audit.vulnerabilities || {}).sort((a, b) => {
  return (rank[a[1].severity] ?? 5) - (rank[b[1].severity] ?? 5)
})

for (const [name, item] of vulnerabilities) {
  const advisories = (item.via || []).map((entry) => {
    if (typeof entry === 'string') return entry
    const title = entry.title || entry.name || 'Advisory'
    return entry.url ? '[' + title + '](' + entry.url + ')' : title
  }).join('; ').replace(/\|/g, '\\|')
  lines.push(
    '| ' + name + ' | ' + item.severity + ' | ' + (item.isDirect ? 'yes' : 'no') +
    ' | ' + (item.range || 'n/a') + ' | ' + (item.fixAvailable ? 'yes' : 'no') + ' | ' + (advisories || 'n/a') + ' |',
  )
}

lines.push(
  '',
  '## Policy', '',
  '- Critical or high production findings fail this command (exit 1).',
  '- Moderate, low and info findings remain visible and require a documented disposition.',
  '- This script does not update package versions or rewrite the lockfile.',
  '- Remediation requires a reviewed dependency PR, lockfile diff, regression CI and a fresh audit artifact.',
  '',
)

const report = lines.join('\n') + '\n'
fs.mkdirSync(path.join(process.cwd(), 'artifacts'), { recursive: true })
fs.writeFileSync(path.join(process.cwd(), 'artifacts/prime-dependency-audit.md'), report)
process.stdout.write(report)

if (result.error) {
  process.stderr.write(result.error.message + '\n')
  process.exit(2)
}
if (result.status !== 0 || (counts.critical || 0) > 0 || (counts.high || 0) > 0) process.exit(1)

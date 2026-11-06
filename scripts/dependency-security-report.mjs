import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs'

function runAudit(args) {
  const result = spawnSync('npm', ['audit', '--json', ...args], {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  })
  let report
  try {
    report = JSON.parse(result.stdout || '{}')
  } catch {
    report = {
      parseError: 'npm audit did not return valid JSON',
      stdoutTail: String(result.stdout || '').slice(-4000),
      stderrTail: String(result.stderr || '').slice(-4000),
    }
  }
  const vulnerabilities = report.vulnerabilities && typeof report.vulnerabilities === 'object'
    ? Object.entries(report.vulnerabilities).map(([name, item]) => ({
        name,
        severity: item.severity || 'unknown',
        isDirect: Boolean(item.isDirect),
        range: item.range || null,
        via: Array.isArray(item.via)
          ? item.via.map((entry) => typeof entry === 'string'
              ? { name: entry }
              : { name: entry.name || null, title: entry.title || null, url: entry.url || null, range: entry.range || null, severity: entry.severity || null })
          : [],
        effects: Array.isArray(item.effects) ? item.effects : [],
        nodes: Array.isArray(item.nodes) ? item.nodes : [],
        fixAvailable: item.fixAvailable ?? null,
      }))
    : []
  return {
    command: ['npm', 'audit', '--json', ...args].join(' '),
    exitCode: result.status,
    signal: result.signal || null,
    error: result.error?.message || null,
    summary: report.metadata?.vulnerabilities || null,
    packages: vulnerabilities,
  }
}

const full = runAudit([])
const production = runAudit(['--omit=dev'])
const report = {
  schemaVersion: 'prime-dependency-security-report-v1',
  generatedAt: new Date().toISOString(),
  commitSha: process.env.GITHUB_SHA || null,
  nodeVersion: process.version,
  npmVersion: spawnSync('npm', ['--version'], { encoding: 'utf8' }).stdout?.trim() || null,
  full,
  production,
  policy: {
    generatedReportIsNotAnApproval: true,
    aggregateCountsAreNotAnAdvisoryDisposition: true,
    reviewedFixesRequireSeparatePullRequestAndRegressionEvidence: true,
  },
}

mkdirSync('artifacts', { recursive: true })
writeFileSync('artifacts/dependency-security-report.json', JSON.stringify(report, null, 2) + '\n')

const summary = (value) => {
  if (!value) return 'audit result unavailable'
  return ['info', 'low', 'moderate', 'high', 'critical']
    .map((key) => `${key}=${value[key] ?? 0}`)
    .join(', ')
}
const lines = [
  '# PRIME dependency security audit',
  '',
  `- Commit: ${report.commitSha || 'local'}`,
  `- Generated: ${report.generatedAt}`,
  `- Full dependency tree: ${summary(full.summary)}`,
  `- Production dependencies only: ${summary(production.summary)}`,
  `- Machine-readable report: artifacts/dependency-security-report.json`,
  '',
  'This workflow generates evidence only. It does not upgrade packages, accept risk, or declare advisories fixed.',
]
const markdown = lines.join('\n')
console.log(markdown)
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown + '\n')

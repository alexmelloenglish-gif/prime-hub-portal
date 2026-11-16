import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const command = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const result = spawnSync(command, ['audit', '--omit=dev', '--json'], {
  cwd: process.cwd(),
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024,
  env: process.env,
})

if (result.error) {
  console.error('[audit:prime-engine] npm audit could not start: ' + result.error.message)
  process.exitCode = 2
} else {
  const stdout = result.stdout || ''
  const firstBrace = stdout.indexOf('{')
  const lastBrace = stdout.lastIndexOf('}')

  if (firstBrace < 0 || lastBrace <= firstBrace) {
    console.error('[audit:prime-engine] npm audit returned no parseable JSON.')
    if (result.stderr) console.error(result.stderr.trim())
    process.exitCode = 2
  } else {
    let audit
    try {
      audit = JSON.parse(stdout.slice(firstBrace, lastBrace + 1))
    } catch (error) {
      console.error('[audit:prime-engine] Invalid npm audit JSON: ' + (error instanceof Error ? error.message : String(error)))
      process.exitCode = 2
    }

    if (audit) {
      const vulnerabilities = audit.vulnerabilities || {}
      const summary = audit.metadata?.vulnerabilities || {}
      const packages = Object.entries(vulnerabilities).map(([name, detail]) => ({
        name,
        severity: detail.severity || 'unknown',
        direct: Boolean(detail.isDirect),
        range: detail.range || '',
        nodes: detail.nodes || [],
        fixAvailable: detail.fixAvailable ?? false,
        advisories: (detail.via || []).map((entry) => (
          typeof entry === 'string'
            ? { name: entry }
            : {
                name: entry.name || entry.title || 'unnamed advisory',
                title: entry.title || '',
                url: entry.url || '',
                range: entry.range || '',
              }
        )),
      })).sort((a, b) => {
        const order = { critical: 0, high: 1, moderate: 2, low: 3, info: 4, unknown: 5 }
        return (order[a.severity] ?? 5) - (order[b.severity] ?? 5) || a.name.localeCompare(b.name)
      })

      const report = {
        generatedAt: new Date().toISOString(),
        commit: spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim() || 'unknown',
        command: 'npm audit --omit=dev --json',
        scope: 'production dependencies only',
        npmExitCode: result.status,
        summary,
        packages,
      }
      const outputDirectory = resolve(process.cwd(), 'artifacts')
      mkdirSync(outputDirectory, { recursive: true })
      writeFileSync(resolve(outputDirectory, 'prime-engine-npm-audit.json'), JSON.stringify(report, null, 2) + '\n')

      const lines = [
        '# PRIME Engine — production dependency audit',
        '',
        '- Generated: ' + report.generatedAt,
        '- Commit: ' + report.commit,
        '- Command: npm audit --omit=dev --json',
        '- Scope: production dependencies only (--omit=dev)',
        '- npm exit code: ' + (report.npmExitCode ?? 'unknown'),
        '',
        '## Summary',
        '',
        '| Critical | High | Moderate | Low | Info | Total |',
        '|---:|---:|---:|---:|---:|---:|',
        '| ' + (summary.critical || 0) + ' | ' + (summary.high || 0) + ' | ' + (summary.moderate || 0) + ' | ' + (summary.low || 0) + ' | ' + (summary.info || 0) + ' | ' + (summary.total || 0) + ' |',
        '',
        '## Affected production packages',
        '',
      ]

      if (!packages.length) {
        lines.push('No production dependency advisories were returned by npm audit.')
      } else {
        for (const item of packages) {
          lines.push('### ' + item.name + ' — ' + item.severity)
          lines.push('- Direct dependency: ' + (item.direct ? 'yes' : 'no'))
          lines.push('- Affected range: ' + (item.range || 'not supplied'))
          lines.push('- Installed nodes: ' + (item.nodes.length ? item.nodes.join(', ') : 'not supplied'))
          lines.push('- Fix available: ' + JSON.stringify(item.fixAvailable))
          for (const advisory of item.advisories) {
            const label = advisory.title || advisory.name
            lines.push('- Advisory: ' + label + (advisory.url ? ' — ' + advisory.url : ''))
          }
          lines.push('')
        }
      }

      lines.push(
        '## Gate',
        '',
        report.npmExitCode === 0 && (summary.total || 0) === 0
          ? 'PASS — no production dependency advisories reported.'
          : 'FAIL / REVIEW REQUIRED — one or more production advisories or an npm audit error were reported. Do not use npm audit fix --force without a reviewed lockfile change.',
        '',
      )
      writeFileSync(resolve(outputDirectory, 'prime-engine-npm-audit.md'), lines.join('\n') + '\n')
      console.log(lines.join('\n'))
      console.log('[audit:prime-engine] machine-readable report: artifacts/prime-engine-npm-audit.json')
      console.log('[audit:prime-engine] review report: artifacts/prime-engine-npm-audit.md')

      if (report.npmExitCode !== 0 || (summary.total || 0) > 0) {
        process.exitCode = 1
      }
    }
  }
}

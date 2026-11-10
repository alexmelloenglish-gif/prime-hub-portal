import fs from 'node:fs'
import { pathToFileURL } from 'node:url'

const severityRank = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 }

function validateReport(report, exitCode, label) {
  if (!Number.isInteger(exitCode) || exitCode < 0 || exitCode > 1) {
    throw new Error(`${label} npm audit failed technically (exit ${exitCode}).`)
  }
  if (!report || typeof report.vulnerabilities !== 'object' || report.vulnerabilities === null) {
    throw new Error(`${label} npm audit JSON has no vulnerabilities object.`)
  }
  if (exitCode === 1 && Object.keys(report.vulnerabilities).length === 0) {
    throw new Error(`${label} npm audit exited 1 without findings; treating this as a technical failure.`)
  }
}

function advisoryEntries(packageName, vulnerability) {
  const via = Array.isArray(vulnerability.via) ? vulnerability.via : []
  const advisories = via
    .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    .map((item) => ({
      id: String(item.source || item.url || item.name || `aggregate:${packageName}`),
      severity: String(item.severity || vulnerability.severity || 'info'),
      range: String(item.range || vulnerability.range || 'unspecified'),
    }))
  if (advisories.length) return advisories
  return [{
    id: `aggregate:${packageName}:${String(vulnerability.range || 'unspecified')}`,
    severity: String(vulnerability.severity || 'info'),
    range: String(vulnerability.range || 'unspecified'),
  }]
}

function indexReport(report) {
  const index = new Map()
  for (const [packageName, vulnerability] of Object.entries(report.vulnerabilities)) {
    const nodes = [...new Set((vulnerability.nodes || []).map(String))].sort()
    for (const advisory of advisoryEntries(packageName, vulnerability)) {
      const key = `${packageName}|${advisory.id}`
      const previous = index.get(key)
      if (previous) {
        previous.nodes = [...new Set([...previous.nodes, ...nodes])].sort()
        previous.severity = (severityRank[advisory.severity] ?? 0) > (severityRank[previous.severity] ?? 0)
          ? advisory.severity : previous.severity
      } else {
        index.set(key, { packageName, ...advisory, nodes })
      }
    }
  }
  return index
}

export function compareAuditReports(baseReport, headReport) {
  const base = indexReport(baseReport)
  const head = indexReport(headReport)
  const regressions = []

  for (const [key, candidate] of head) {
    const existing = base.get(key)
    if (!existing) {
      regressions.push({ type: 'new-advisory', ...candidate })
      continue
    }
    if (candidate.range !== existing.range) {
      regressions.push({
        type: 'affected-range-change',
        packageName: candidate.packageName,
        id: candidate.id,
        from: existing.range,
        to: candidate.range,
      })
    }
    if ((severityRank[candidate.severity] ?? 0) > (severityRank[existing.severity] ?? 0)) {
      regressions.push({
        type: 'severity-increase',
        packageName: candidate.packageName,
        id: candidate.id,
        from: existing.severity,
        to: candidate.severity,
        nodes: candidate.nodes,
      })
    }
    const oldNodes = new Set(existing.nodes)
    for (const node of candidate.nodes) {
      if (!oldNodes.has(node)) {
        regressions.push({
          type: 'new-vulnerable-path',
          packageName: candidate.packageName,
          id: candidate.id,
          severity: candidate.severity,
          node,
        })
      }
    }
  }
  return { regressions, baseFindingCount: base.size, headFindingCount: head.size }
}

function main() {
  const [basePath, headPath, baseExitArg, headExitArg] = process.argv.slice(2)
  if (!basePath || !headPath || baseExitArg === undefined || headExitArg === undefined) {
    throw new Error('Usage: node scripts/npm-audit-delta.mjs <base.json> <head.json> <base-exit> <head-exit>')
  }
  const baseExit = Number(baseExitArg)
  const headExit = Number(headExitArg)
  const baseReport = JSON.parse(fs.readFileSync(basePath, 'utf8'))
  const headReport = JSON.parse(fs.readFileSync(headPath, 'utf8'))
  validateReport(baseReport, baseExit, 'Base')
  validateReport(headReport, headExit, 'Head')
  const result = compareAuditReports(baseReport, headReport)
  console.log(`Base advisory/package findings: ${result.baseFindingCount}`)
  console.log(`Head advisory/package findings: ${result.headFindingCount}`)
  if (result.regressions.length) {
    console.error('Dependency audit delta failed:')
    for (const finding of result.regressions) console.error(JSON.stringify(finding))
    process.exitCode = 1
    return
  }
  console.log('Dependency audit delta passed: no new advisories, vulnerable paths or severity increases.')
  console.log('This is a regression comparison only; existing findings remain open and require separate remediation.')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()

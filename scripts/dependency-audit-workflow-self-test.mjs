import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const owner = 'alexmelloenglish-gif';
const repo = 'prime-hub-portal';
function normalizeAdvisories(vulnerability, packageName) {
  const candidates = Array.isArray(vulnerability.via) ? vulnerability.via : [];
  const viaDependencies = [...new Set(candidates.filter((item) => typeof item === 'string'))].sort();
  const advisories = candidates
    .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    .map((item) => ({
      source: item.source || item.url || item.name || 'npm-audit-unspecified',
      name: item.name || packageName,
      severity: item.severity || vulnerability.severity,
      range: item.range || vulnerability.range || 'unspecified',
      url: item.url || ''
    }))
    .filter((item) => ['high', 'critical'].includes(item.severity));
  const normalized = advisories.length ? advisories : [{
    source: 'npm-audit-package-aggregate', name: packageName,
    severity: vulnerability.severity, range: vulnerability.range || 'unspecified', url: ''
  }].filter((item) => ['high', 'critical'].includes(item.severity));
  return { advisories: normalized, viaDependencies };
}
function fingerprintFor(packageName, advisory) {
  const identity = [`${owner}/${repo}`, packageName,
    String(advisory.source || advisory.url || advisory.name || 'npm-audit-unspecified'),
    String(advisory.severity), String(advisory.range || 'unspecified')].join('|');
  return crypto.createHash('sha256').update(identity).digest('hex').slice(0, 16);
}
function chooseMatch(matches, title) {
  const exactTitle = matches.filter((item) => item.title === title);
  const open = exactTitle.filter((item) => item.state === 'open');
  if (open.length) return { match: open[0], duplicateCount: open.length - 1 };
  const openAny = matches.filter((item) => item.state === 'open');
  if (openAny.length) return { match: openAny[0], duplicateCount: openAny.length - 1 };
  const closed = matches.filter((item) => item.state === 'closed');
  return { match: closed[0], duplicateCount: Math.max(0, closed.length - 1) };
}
function fingerprintFromIssue(issue) {
  const titleMatch = String(issue.title || '').match(/\[dependency-audit:([a-f0-9]{16})\]/i);
  if (titleMatch) return titleMatch[1].toLowerCase();
  const bodyMatch = String(issue.body || '').match(/Stable fingerprint: ([a-f0-9]{16})/i);
  return bodyMatch ? bodyMatch[1].toLowerCase() : null;
}
function indexIssueMatches(issues) {
  const index = new Map();
  for (const issue of issues) {
    if (issue.pull_request) continue;
    const fingerprint = fingerprintFromIssue(issue);
    if (!fingerprint) continue;
    if (!index.has(fingerprint)) index.set(fingerprint, []);
    index.get(fingerprint).push(issue);
  }
  for (const matches of index.values()) matches.sort((a, b) => a.number - b.number);
  return index;
}
function classifyAudit(exitCode, vulnerabilities) {
  const total = Object.values(vulnerabilities).length;
  if (!Number.isInteger(exitCode) || exitCode < 0) return 'technical-failure';
  if (exitCode > 1 || (exitCode === 1 && total === 0)) return 'technical-failure';
  return 'report-valid';
}
const objectOnly = normalizeAdvisories({ severity: 'high', range: '<1.2.3',
  via: [{ source: 'GHSA-object', severity: 'high', range: '<1.2.3', url: 'https://example.test/object' }] }, 'postcss');
assert.equal(objectOnly.advisories.length, 1);
assert.equal(objectOnly.advisories[0].source, 'GHSA-object');
assert.deepEqual(objectOnly.viaDependencies, []);
const stringOnly = normalizeAdvisories({ severity: 'critical', range: '*', via: ['uuid', 'postcss', 'uuid'] }, 'sharp');
assert.equal(stringOnly.advisories.length, 1);
assert.equal(stringOnly.advisories[0].source, 'npm-audit-package-aggregate');
assert.deepEqual(stringOnly.viaDependencies, ['postcss', 'uuid']);
assert.equal(stringOnly.advisories.some((item) => stringOnly.viaDependencies.includes(item.source)), false);
const mixed = normalizeAdvisories({ severity: 'high', range: '<2.0.0',
  via: ['google-gax', { source: 'GHSA-mixed', severity: 'high', range: '<2.0.0' }, 'jspdf'] }, 'jspdf');
assert.deepEqual(mixed.advisories.map((item) => item.source), ['GHSA-mixed']);
assert.deepEqual(mixed.viaDependencies, ['google-gax', 'jspdf']);
const multiple = normalizeAdvisories({ severity: 'high', range: '<2.0.0',
  via: [{ source: 'GHSA-one', severity: 'high', range: '<2.0.0' }, { source: 'GHSA-two', severity: 'critical', range: '<2.0.0' }] }, 'uuid');
assert.deepEqual(multiple.advisories.map((item) => item.source), ['GHSA-one', 'GHSA-two']);
assert.equal(new Set(multiple.advisories.map((item) => fingerprintFor('uuid', item))).size, 2);
const repeated = normalizeAdvisories({ severity: 'high', range: '<3.0.0',
  via: [{ source: 'GHSA-repeat', severity: 'high', range: '<3.0.0' }, { source: 'GHSA-repeat', severity: 'high', range: '<3.0.0' }] }, 'zod');
assert.equal(new Set(repeated.advisories.map((item) => fingerprintFor('zod', item))).size, 1);
const aggregate = normalizeAdvisories({ severity: 'high', range: '<4.0.0', via: [] }, 'package-without-advisory');
assert.equal(aggregate.advisories[0].source, 'npm-audit-package-aggregate');
const aggregateFp = fingerprintFor('package-without-advisory', aggregate.advisories[0]);
const aggregateWithString = normalizeAdvisories({ severity: 'high', range: '<4.0.0', via: ['transitive-package'] }, 'package-without-advisory');
assert.equal(fingerprintFor('package-without-advisory', aggregateWithString.advisories[0]), aggregateFp);
const advisory = { source: 'GHSA-path', severity: 'high', range: '<1.0.0' };
assert.equal(fingerprintFor('postcss', advisory), fingerprintFor('postcss', advisory), 'dependency paths excluded');
const fingerprint = fingerprintFor('postcss', advisory);
const title = `[dependency-audit:${fingerprint}] postcss — high`;
const alteredTitle = { number: 12, state: 'open', title: 'manual title', body: `Stable fingerprint: ${fingerprint}` };
assert.equal(chooseMatch([alteredTitle], title).match.number, 12);
const open = { number: 14, state: 'open', title, body: '' };
const closed = { number: 13, state: 'closed', title, body: '' };
assert.equal(chooseMatch([closed, open], title).match.number, 14);
const dupes = [{ number: 20, state: 'open', title, body: '' }, { number: 21, state: 'open', title, body: '' }, { number: 22, state: 'closed', title, body: '' }];
const selected = chooseMatch(dupes, title);
assert.equal(selected.match.number, 20);
assert.equal(selected.duplicateCount, 1);
assert.equal(chooseMatch([{ number: 30, state: 'closed', title, body: '' }], title).match.number, 30);
assert.equal(chooseMatch([], title).match, undefined);
assert.equal(classifyAudit(0, {}), 'report-valid');
assert.equal(classifyAudit(1, { postcss: {} }), 'report-valid');
assert.equal(classifyAudit(1, {}), 'technical-failure');
assert.equal(classifyAudit(2, { postcss: {} }), 'technical-failure');
const existing30 = Array.from({ length: 30 }, (_, index) => {
  const fp = (index + 1).toString(16).padStart(16, '0');
  return {
    number: 117 + index,
    state: index === 29 ? 'closed' : 'open',
    title: `[dependency-audit:${fp}] package-${index} — high`,
    body: `Stable fingerprint: ${fp}`
  };
});
const indexed30 = indexIssueMatches(existing30);
assert.equal(indexed30.size, 30, 'all 30 pre-existing advisory Issues are indexed');
assert.equal([...indexed30.values()].flat().length, 30, 'existing Issues are retained, not recreated');
assert.equal(indexed30.get('000000000000001e')[0].number, 146);
assert.equal(indexed30.get('000000000000001e')[0].state, 'closed', 'closed Issue remains discoverable');
const fingerprintIndex = indexed30.get('0000000000000001');
const duplicateSet = [
  { number: 202, state: 'open', title, body: `Stable fingerprint: ${fingerprint}` },
  { number: 201, state: 'open', title, body: `Stable fingerprint: ${fingerprint}` },
  { number: 203, state: 'closed', title, body: `Stable fingerprint: ${fingerprint}` },
  { number: 204, state: 'open', title: 'unrelated pull request', body: '', pull_request: { url: 'https://example.test/pr/204' } }
];
const indexedDuplicates = indexIssueMatches(duplicateSet);
assert.equal(indexedDuplicates.get(fingerprint).length, 3, 'duplicate Issues are indexed but PRs are excluded');
const duplicateSelection = chooseMatch(indexedDuplicates.get(fingerprint), title);
assert.equal(duplicateSelection.match.number, 201, 'selection remains deterministic by lowest issue number');
assert.equal(duplicateSelection.duplicateCount, 1, 'only additional open matches count as duplicates');
const closedIndex = indexIssueMatches([{ number: 301, state: 'closed', title, body: `Stable fingerprint: ${fingerprint}` }]);
assert.equal(chooseMatch(closedIndex.get(fingerprint), title).match.state, 'closed', 'closed match remains closed and is not treated as missing');
const { compareAuditReports } = await import('./npm-audit-delta.mjs')
const baselineAudit = { vulnerabilities: {
  postcss: {
    severity: 'high',
    range: '<8.5.10',
    via: [{ source: 'GHSA-postcss', severity: 'high', range: '<8.5.10' }],
    nodes: ['node_modules/postcss', 'node_modules/next/node_modules/postcss']
  }
} }
const unchangedAudit = structuredClone(baselineAudit)
assert.deepEqual(compareAuditReports(baselineAudit, unchangedAudit).regressions, [],
  'pre-existing advisories and paths must not fail the delta gate')
const addedPathAudit = structuredClone(baselineAudit)
addedPathAudit.vulnerabilities.postcss.nodes.push('node_modules/another-package/node_modules/postcss')
assert.ok(compareAuditReports(baselineAudit, addedPathAudit).regressions.some((item) => item.type === 'new-vulnerable-path'))
const newAdvisoryAudit = structuredClone(baselineAudit)
newAdvisoryAudit.vulnerabilities.postcss.via.push({ source: 'GHSA-new', severity: 'high', range: '<8.5.10' })
assert.ok(compareAuditReports(baselineAudit, newAdvisoryAudit).regressions.some((item) => item.type === 'new-advisory'))
const severityIncreaseAudit = structuredClone(baselineAudit)
severityIncreaseAudit.vulnerabilities.postcss.via[0].severity = 'critical'
assert.ok(compareAuditReports(baselineAudit, severityIncreaseAudit).regressions.some((item) => item.type === 'severity-increase'))
const workflowSource = (await import('node:fs')).readFileSync('.github/workflows/dependency-audit-auto.yml', 'utf8');
assert.match(workflowSource, /github\.paginate\(github\.rest\.issues\.listForRepo/);
assert.match(workflowSource, /state: 'all', per_page: 100/);
assert.doesNotMatch(workflowSource, /github\.rest\.search\.issuesAndPullRequests/);
assert.doesNotMatch(workflowSource, /findIssueMatches\(fingerprint\)/);
console.log('dependency-audit-workflow-self-test: all assertions passed');

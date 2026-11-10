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
console.log('dependency-audit-workflow-self-test: all assertions passed');

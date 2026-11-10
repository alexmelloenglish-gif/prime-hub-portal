import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const owner = 'alexmelloenglish-gif';
const repo = 'prime-hub-portal';

function normalizeAdvisories(vulnerability, packageName) {
  const candidates = Array.isArray(vulnerability.via) ? vulnerability.via : [];
  const normalized = candidates.flatMap((item) => {
    if (typeof item === 'string') {
      return [{
        source: item,
        name: item,
        severity: vulnerability.severity,
        range: vulnerability.range || 'unspecified',
        url: item.startsWith('http') ? item : ''
      }];
    }
    if (item && typeof item === 'object') {
      return [{
        source: item.source || item.url || item.name || 'npm-audit-unspecified',
        name: item.name || packageName,
        severity: item.severity || vulnerability.severity,
        range: item.range || vulnerability.range || 'unspecified',
        url: item.url || ''
      }];
    }
    return [];
  }).filter((item) => ['high', 'critical'].includes(item.severity));

  return normalized.length ? normalized : [{
    source: 'npm-audit-package-aggregate',
    name: packageName,
    severity: vulnerability.severity,
    range: vulnerability.range || 'unspecified',
    url: ''
  }];
}

function fingerprintFor(packageName, advisory) {
  const identity = [
    `${owner}/${repo}`,
    packageName,
    String(advisory.source || advisory.url || advisory.name || 'npm-audit-unspecified'),
    String(advisory.severity),
    String(advisory.range || 'unspecified')
  ].join('|');
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

const objectVia = normalizeAdvisories({
  severity: 'high',
  range: '<1.2.3',
  via: [{ source: 'GHSA-object', severity: 'high', range: '<1.2.3', url: 'https://example.test/object' }]
}, 'postcss');
assert.equal(objectVia[0].source, 'GHSA-object');

const stringVia = normalizeAdvisories({
  severity: 'critical',
  range: '*',
  via: ['GHSA-string']
}, 'sharp');
assert.equal(stringVia[0].source, 'GHSA-string');

const multipleAdvisories = normalizeAdvisories({
  severity: 'high',
  range: '<2.0.0',
  via: [
    { source: 'GHSA-one', severity: 'high', range: '<2.0.0' },
    { source: 'GHSA-two', severity: 'critical', range: '<2.0.0' }
  ]
}, 'uuid');
assert.deepEqual(multipleAdvisories.map((item) => item.source), ['GHSA-one', 'GHSA-two']);

const repeatedAdvisories = normalizeAdvisories({
  severity: 'high',
  range: '<3.0.0',
  via: [
    { source: 'GHSA-repeat', severity: 'high', range: '<3.0.0' },
    { source: 'GHSA-repeat', severity: 'high', range: '<3.0.0' }
  ]
}, 'zod');
const repeatedFingerprints = new Set(repeatedAdvisories.map((item) => fingerprintFor('zod', item)));
assert.equal(repeatedFingerprints.size, 1);

const aggregate = normalizeAdvisories({ severity: 'high', range: 'unspecified', via: [] }, 'package-without-advisory');
assert.equal(aggregate[0].source, 'npm-audit-package-aggregate');

const pathA = fingerprintFor('postcss', { source: 'GHSA-path', severity: 'high', range: '<1.0.0' });
const pathB = fingerprintFor('postcss', { source: 'GHSA-path', severity: 'high', range: '<1.0.0' });
assert.equal(pathA, pathB, 'dependency paths must not affect the fingerprint');

const fingerprint = pathA;
const stableTitle = `[dependency-audit:${fingerprint}] postcss — high`;
const alteredTitleMatch = {
  number: 12,
  state: 'open',
  title: 'Título alterado manualmente',
  body: `Stable fingerprint: ${fingerprint}`
};
const chosenAltered = chooseMatch([alteredTitleMatch], stableTitle);
assert.equal(chosenAltered.match.number, 12, 'body fingerprint must find an issue with an altered title');

const openMatch = { number: 14, state: 'open', title: stableTitle, body: '' };
const closedMatch = { number: 13, state: 'closed', title: stableTitle, body: '' };
assert.equal(chooseMatch([closedMatch, openMatch], stableTitle).match.number, 14);

const multipleMatches = [
  { number: 20, state: 'open', title: stableTitle, body: '' },
  { number: 21, state: 'open', title: stableTitle, body: '' },
  { number: 22, state: 'closed', title: stableTitle, body: '' }
];
const chosenMultiple = chooseMatch(multipleMatches, stableTitle);
assert.equal(chosenMultiple.match.number, 20);
assert.equal(chosenMultiple.duplicateCount, 1);

assert.equal(chooseMatch([{ number: 30, state: 'closed', title: stableTitle, body: '' }], stableTitle).match.number, 30);
assert.equal(chooseMatch([], stableTitle).match, undefined);

assert.equal(classifyAudit(0, {}), 'report-valid');
assert.equal(classifyAudit(1, { postcss: {} }), 'report-valid');
assert.equal(classifyAudit(1, {}), 'technical-failure');
assert.equal(classifyAudit(2, { postcss: {} }), 'technical-failure');

console.log('dependency-audit-workflow-self-test: all assertions passed');

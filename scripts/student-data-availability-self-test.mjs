import assert from 'node:assert/strict'
import { buildLearningDataStatus, classifyAdminDataAvailability } from '../lib/student-data-status.ts'
const unavailable = buildLearningDataStatus({ repositoryFound: true, databaseAvailable: false, hasCurrentProjection: false })
assert.deepEqual(unavailable, { source: 'historical_snapshot', availability: 'unavailable', asOf: null, reason: 'database_unavailable' })
const historical = buildLearningDataStatus({ repositoryFound: true, databaseAvailable: true, hasCurrentProjection: false })
assert.deepEqual(historical, { source: 'historical_snapshot', availability: 'historical', asOf: null, reason: 'no_published_projection' })
const current = buildLearningDataStatus({ repositoryFound: true, databaseAvailable: true, hasCurrentProjection: true, asOf: '2026-11-10T00:00:00.000Z' })
assert.deepEqual(current, { source: 'neon', availability: 'current', asOf: '2026-11-10T00:00:00.000Z' })
assert.equal(classifyAdminDataAvailability({ databaseAvailable: false, publishedReportCount: 10 }), 'unavailable')
assert.equal(classifyAdminDataAvailability({ databaseAvailable: true, publishedReportCount: 0 }), 'historical')
assert.equal(classifyAdminDataAvailability({ databaseAvailable: true, publishedReportCount: 1 }), 'current')
console.log('student-data-availability-self-test: all assertions passed')

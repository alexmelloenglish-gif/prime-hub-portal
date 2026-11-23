export type LearningDataSource = 'neon' | 'historical_snapshot' | 'mixed' | 'none'
export type LearningDataAvailability = 'current' | 'mixed' | 'historical' | 'unavailable'
export type LearningDataReason = 'database_unavailable' | 'no_published_projection' | 'no_authorized_profile'

export type LearningDataStatus = {
  source: LearningDataSource
  availability: LearningDataAvailability
  asOf: string | null
  reason?: LearningDataReason
}

export type DashboardMergeStatus = {
  databaseAvailable: boolean
  hasCurrentProjection: boolean
  asOf: string | null
}

export function buildLearningDataStatus(input: {
  repositoryFound: boolean
  databaseAvailable: boolean
  hasCurrentProjection: boolean
  asOf?: string | null
}): LearningDataStatus {
  if (!input.repositoryFound) {
    return { source: 'none', availability: 'unavailable', asOf: null, reason: 'no_authorized_profile' }
  }
  if (!input.databaseAvailable) {
    return {
      source: 'historical_snapshot',
      availability: 'unavailable',
      asOf: null,
      reason: 'database_unavailable',
    }
  }
  if (!input.hasCurrentProjection) {
    return {
      source: 'historical_snapshot',
      availability: 'historical',
      asOf: null,
      reason: 'no_published_projection',
    }
  }
  return {
    source: 'mixed',
    availability: 'mixed',
    asOf: input.asOf || null,
  }
}

export function classifyAdminDataAvailability(input: {
  databaseAvailable: boolean
  publishedReportCount: number
  latestPipelineStatus?: string | null
}): 'current' | 'mixed' | 'historical' | 'unavailable' {
  if (!input.databaseAvailable) return 'unavailable'
  // The directory profile is still snapshot-backed. A live published report
  // makes the record mixed, not wholly current.
  if (input.publishedReportCount > 0) return 'mixed'
  return 'historical'
}

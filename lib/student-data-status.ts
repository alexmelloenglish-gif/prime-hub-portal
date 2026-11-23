export type LearningDataSource = 'neon' | 'historical_snapshot' | 'none'
export type LearningDataAvailability = 'current' | 'historical' | 'unavailable'
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
    source: 'neon',
    availability: 'current',
    asOf: input.asOf || null,
  }
}

export function classifyAdminDataAvailability(input: {
  databaseAvailable: boolean
  publishedReportCount: number
  latestPipelineStatus?: string | null
}): 'current' | 'historical' | 'unavailable' {
  if (!input.databaseAvailable) return 'unavailable'
  if (input.publishedReportCount > 0 || Boolean(input.latestPipelineStatus)) return 'current'
  return 'historical'
}

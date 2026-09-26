export type SharedRunClaimResult<T> = {
  claimed: boolean
  current: T
}

export async function claimFailedSharedRun<T>(input: {
  claim: () => Promise<number>
  readCurrent: () => Promise<T | null>
}): Promise<SharedRunClaimResult<T>> {
  const claimedCount = await input.claim()
  if (claimedCount !== 0 && claimedCount !== 1) {
    throw new Error(`Shared runner resume claim changed ${claimedCount} rows; expected at most one`)
  }

  const current = await input.readCurrent()
  if (!current) {
    throw new Error('Shared runner resume claim lost the durable PipelineRun')
  }

  return {
    claimed: claimedCount === 1,
    current,
  }
}

export async function resolveUniqueSharedRunConflict<T>(input: {
  error: unknown
  isUniqueConstraintError: (error: unknown) => boolean
  loadExisting: () => Promise<T | null>
}): Promise<T> {
  if (!input.isUniqueConstraintError(input.error)) {
    throw input.error
  }

  const existing = await input.loadExisting()
  if (!existing) {
    throw input.error
  }

  return existing
}

export type TeacherAuthorityBinding = {
  reviewerId: string
  decisionTimestamp: Date
  authorityPayloadHash: string
}

export function assertTeacherAuthorityBinding(
  expected: TeacherAuthorityBinding,
  persisted: {
    reviewerId: string
    decisionTimestamp: Date
    authorityPayloadHash: string | null
  },
) {
  if (persisted.reviewerId !== expected.reviewerId) {
    throw new Error('Shared runner Teacher Authority reviewer changed during resume')
  }
  if (persisted.decisionTimestamp.getTime() !== expected.decisionTimestamp.getTime()) {
    throw new Error('Shared runner Teacher Authority timestamp changed during resume')
  }
  if (persisted.authorityPayloadHash !== expected.authorityPayloadHash) {
    throw new Error('Shared runner Teacher Authority payload hash changed during resume')
  }
}

export async function resolveProtectedStage<T>(input: {
  shouldRun: boolean
  execute: () => Promise<T>
  load: () => Promise<T>
}): Promise<T> {
  return input.shouldRun
    ? input.execute()
    : input.load()
}

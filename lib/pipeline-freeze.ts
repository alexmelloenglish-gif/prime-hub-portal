export const PIPELINE_AUTOMATION_FROZEN = true

export const PIPELINE_FREEZE_CODE = 'PIPELINE_AUTOMATION_FROZEN'

export const PIPELINE_FREEZE_REASON =
  'Legacy transcript automation is frozen during the canonical dashboard repair. Historical runs are preserved; no new ingest, retry, or Drive reconciliation is allowed.'

export function pipelineFreezePayload(trigger: string) {
  return {
    ok: false,
    frozen: PIPELINE_AUTOMATION_FROZEN,
    code: PIPELINE_FREEZE_CODE,
    error: PIPELINE_FREEZE_REASON,
    trigger,
  }
}

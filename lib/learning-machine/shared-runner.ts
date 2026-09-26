import type { LessonTranscriptInput, PipelineResult } from '@/lib/pipeline/contracts'
import { processLessonTranscript } from '@/lib/pipeline/run'
import {
  buildSharedLearningMachineExecutionOptions,
  normalizeLearningMachineInput,
  type SharedLearningMachineTriggerOrigin,
} from '@/lib/learning-machine/shared-run-contract'

export type SharedLearningMachineCommand = {
  triggerOrigin: SharedLearningMachineTriggerOrigin
  requestedBy?: string
  transcript: LessonTranscriptInput
}

export async function executeSharedLearningMachine(
  command: SharedLearningMachineCommand,
): Promise<PipelineResult> {
  const transcript = normalizeLearningMachineInput(command.transcript)
  const options = buildSharedLearningMachineExecutionOptions({
    transcript,
    triggerOrigin: command.triggerOrigin,
    requestedBy: command.requestedBy,
  })

  return processLessonTranscript(transcript, options)
}

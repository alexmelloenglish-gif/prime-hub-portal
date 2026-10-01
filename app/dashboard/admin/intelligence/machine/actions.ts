'use server'

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prepareDriveTranscriptPayload } from '@/lib/drive-reconciliation'
import { executeSharedLearningMachine } from '@/lib/learning-machine/shared-runner'
import { isAdminUser } from '@/lib/student-data'

export async function processDriveTranscriptSource(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdminUser(session.user)) {
    redirect('/dashboard/admin/intelligence/machine?error=Administrator%20access%20required')
  }

  const sourceFileId = String(formData.get('sourceFileId') || '').trim()
  if (!sourceFileId) {
    redirect('/dashboard/admin/intelligence/machine?error=Source%20file%20is%20required')
  }

  let result: Awaited<ReturnType<typeof executeSharedLearningMachine>>
  try {
    const transcript = await prepareDriveTranscriptPayload(sourceFileId, {
      ingestionMode: 'manual-drive-source-v1',
    })
    result = await executeSharedLearningMachine({
      triggerOrigin: 'manual',
      requestedBy: session.user.email || session.user.id || 'admin',
      transcript,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Learning Machine execution failed'
    redirect(`/dashboard/admin/intelligence/machine?error=${encodeURIComponent(message)}`)
  }

  if (result.validationTaskId) {
    redirect(`/dashboard/admin/intelligence/validation/${encodeURIComponent(result.validationTaskId)}`)
  }

  redirect(`/dashboard/admin/intelligence/lessons/${encodeURIComponent(result.pipelineRunId)}?machineStatus=${encodeURIComponent(result.status)}`)
}

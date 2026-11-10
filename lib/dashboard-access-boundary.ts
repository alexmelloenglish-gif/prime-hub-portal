export function resolveDashboardTargetEmail(input: {
  viewerEmail: string
  requestedStudentEmail?: string | null
  mayPreviewAnotherStudent: boolean
}): string {
  const viewerEmail = input.viewerEmail.trim().toLowerCase()
  const requestedEmail = input.requestedStudentEmail?.trim().toLowerCase() || ''
  if (!viewerEmail) return ''
  if (
    input.mayPreviewAnotherStudent
    && requestedEmail
    && requestedEmail !== viewerEmail
  ) {
    return requestedEmail
  }
  return viewerEmail
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const candidate = origin || referer

  if (!candidate) return false

  try {
    const candidateUrl = new URL(candidate)
    const requestUrl = new URL(request.url)
    const configuredOrigin = process.env.NEXTAUTH_URL
      ? new URL(process.env.NEXTAUTH_URL).origin
      : requestUrl.origin

    return candidateUrl.origin === configuredOrigin || candidateUrl.origin === requestUrl.origin
  } catch {
    return false
  }
}

export function rejectCrossOriginMutation(request: Request): Response | null {
  if (isSameOriginRequest(request)) return null

  return Response.json(
    { error: 'same_origin_required' },
    { status: 403, headers: { 'cache-control': 'no-store' } }
  )
}

import { NextResponse } from 'next/server'
import { checkProviderHealth } from '@/lib/pipeline/provider-health'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requiredToken = process.env.PRIME_HEALTH_TOKEN

  if (requiredToken && request.headers.get('x-prime-health-token') !== requiredToken) {
    return NextResponse.json(
      {
        error: 'PROVIDER_HEALTH_UNAUTHORIZED',
        message: 'Provider health endpoint requires a valid health token.',
      },
      { status: 401 },
    )
  }

  const report = await checkProviderHealth()
  const statusCode = report.overallStatus === 'unhealthy' ? 503 : 200

  return NextResponse.json(report, {
    status: statusCode,
    headers: { 'cache-control': 'no-store' },
  })
}

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getNextAuthSecret } from '@/lib/auth-runtime'

const allowedDashboardPaths = new Set([
  '/dashboard',
  '/dashboard/aulas',
  '/dashboard/progresso',
  '/dashboard/goals',
  '/dashboard/metas',
  '/dashboard/conversacao',
  '/dashboard/configuracoes',
  '/dashboard/admin',
  '/dashboard/admin/review',
])

const allowedDashboardPrefixes = ['/dashboard/admin/intelligence']

function normalizeDashboardPath(pathname: string) {
  if (allowedDashboardPaths.has(pathname)) {
    return pathname
  }

  if (allowedDashboardPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return pathname
  }

  return '/dashboard'
}

export async function middleware(request: NextRequest) {
  const normalizedPathname = normalizeDashboardPath(request.nextUrl.pathname)
  const token = await getToken({
    req: request,
    secret: getNextAuthSecret(),
  })

  const isLoginPage = request.nextUrl.pathname.startsWith('/login')

  if (!token && !isLoginPage) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  if (normalizedPathname !== request.nextUrl.pathname) {
    return NextResponse.redirect(new URL(normalizedPathname, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}

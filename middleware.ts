import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const allowedDashboardPaths = new Set([
  '/dashboard',
  '/dashboard/aulas',
  '/dashboard/progresso',
  '/dashboard/goals',
  '/dashboard/metas',
  '/dashboard/conversacao',
  '/dashboard/configuracoes',
  '/dashboard/admin',
])

function normalizeDashboardPath(pathname: string) {
  return allowedDashboardPaths.has(pathname) ? pathname : '/dashboard'
}

export async function middleware(request: NextRequest) {
  const normalizedPathname = normalizeDashboardPath(request.nextUrl.pathname)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isLoginPage = request.nextUrl.pathname.startsWith('/login')

  // se não tem token e não está no login → bloqueia
  if (!token && !isLoginPage) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', normalizedPathname)
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

import { appendFileSync } from 'node:fs'
import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { getPrismaClient } from '@/lib/prisma'

export const isGoogleAuthConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
)

export const isDatabaseConfigured = Boolean(
  process.env.AUTH_USE_DATABASE === 'true' && process.env.DATABASE_URL
)

function writeAuthDebug(level: 'DEBUG' | 'WARN' | 'ERROR', code: string, metadata?: unknown) {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  const line = [
    new Date().toISOString(),
    level,
    code,
    metadata ? JSON.stringify(metadata, null, 2) : '',
  ]
    .filter(Boolean)
    .join(' | ')

  appendFileSync('nextauth-debug.log', `${line}\n`, 'utf8')
}

export const authOptions: NextAuthOptions = {
  adapter: isDatabaseConfigured ? PrismaAdapter(getPrismaClient()) : undefined,
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      writeAuthDebug('ERROR', code, metadata)
    },
    warn(code) {
      writeAuthDebug('WARN', code)
    },
    debug(code, metadata) {
      writeAuthDebug('DEBUG', code, metadata)
    },
  },
  session: {
    strategy: 'jwt',
  },
  providers: isGoogleAuthConfigured
    ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID ?? '',
          clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        }),
      ]
    : [],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id =
          ('id' in user && typeof user.id === 'string' && user.id) ||
          account?.providerAccountId ||
          token.sub ||
          ''
        token.role = (user as { role?: string }).role ?? 'student'
      }

      if (isDatabaseConfigured && token.email && (!token.id || !token.role)) {
        const dbUser = await getPrismaClient().user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true },
        })

        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === 'string' ? token.id : token.sub ?? ''
        session.user.role = typeof token.role === 'string' ? token.role : 'student'
      }

      return session
    },
    async signIn({ account, profile }) {
      if (account?.provider !== 'google') {
        return false
      }

      return Boolean(profile?.email)
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }

      try {
        const targetUrl = new URL(url)

        if (targetUrl.origin === baseUrl) {
          return url
        }
      } catch {
        return `${baseUrl}/dashboard`
      }

      return `${baseUrl}/dashboard`
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

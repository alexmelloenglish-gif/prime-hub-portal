import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const isGoogleAuthConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
)

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
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

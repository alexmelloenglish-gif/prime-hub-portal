import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { getPrismaClient } from '@/lib/prisma'

const databaseAdapter = process.env.DATABASE_URL
  ? PrismaAdapter(getPrismaClient())
  : undefined

export const authOptions: NextAuthOptions = {
  adapter: databaseAdapter,
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
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
    async signIn({ profile }) {
      return Boolean(profile?.email)
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

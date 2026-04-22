import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { getPrismaClient } from '@/lib/prisma'



const prisma = getPrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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
    // 1. So permite entrar se o e-mail ja estiver cadastrado no banco
    async signIn({ user }) {
      if (!user?.email) return false

      // Verifica se o usuario existe no banco
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      })

      // Se nao existe, bloqueia o login
      if (!existingUser) {
        return false
      }

      return true
    },

    // 2. Coloca o id e a role no JWT
    async jwt({ token, user, account }) {
      if (user) {
        token.id =
          ('id' in user && typeof user.id === 'string' && user.id) ||
          account?.providerAccountId ||
          token.sub ||
          ''

        // Busca a role atual do banco
        if (user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { role: true },
          })
          token.role = dbUser?.role ?? 'student'
        }
      }
      return token
    },

    // 3. Passa id e role para a session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === 'string' ? token.id : token.sub ?? ''
        session.user.role = typeof token.role === 'string' ? token.role : 'student'
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

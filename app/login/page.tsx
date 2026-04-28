import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import { authOptions } from '@/lib/auth'

export default async function LoginPage() {
  const session = await getServerSession(authOptions)

  // Se já está autenticado, vai para o dashboard — o layout do dashboard
  // decide se o aluno tem acesso ou redireciona para pending-access
  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-prime-gradient p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-prime-cream/60 transition-colors hover:text-white">
          <span>&larr;</span>
          <span>Voltar ao início</span>
        </Link>

        <div className="glass-card space-y-6 p-8">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-prime-red text-3xl font-bold text-white shadow-lg shadow-prime-red/30">
              P
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h1 className="font-display text-2xl font-bold text-white">Acesse sua conta</h1>
            <p className="text-prime-cream/70">
              Entre no Prime Digital Hub com sua conta Google.
            </p>
          </div>

          <GoogleSignInButton />

          <div className="text-center text-sm text-prime-cream/60">
            Ao continuar, você concorda com nossos termos de uso e política de privacidade.
          </div>

          <div className="text-center text-sm text-prime-cream/60">
            Problemas ao entrar?{' '}
            <a href="mailto:support@primedigitalhub.com" className="font-semibold text-prime-red hover:underline">
              Entre em contato
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}

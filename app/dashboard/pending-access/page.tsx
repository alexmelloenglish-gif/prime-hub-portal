import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Clock, Mail, ArrowRight } from 'lucide-react'
import { authOptions } from '@/lib/auth'

export default async function PendingAccessPage() {
  const session = await getServerSession(authOptions)

  // Se não estiver logado, redireciona para login
  if (!session?.user) {
    redirect('/login')
  }

  // Se for admin, redireciona para o dashboard
  if (session.user.role === 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-prime-gradient p-4">
      <div className="w-full max-w-md">
        <div className="glass-card space-y-6 p-8">
          {/* Ícone */}
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-prime-red/20 ring-2 ring-prime-red">
              <Clock className="h-10 w-10 text-prime-red" />
            </div>
          </div>

          {/* Conteúdo */}
          <div className="space-y-4 text-center">
            <h1 className="font-display text-2xl font-bold text-white">
              Acesso em Análise
            </h1>
            <p className="text-prime-cream/70">
              Sua conta foi criada com sucesso! Estamos analisando seu perfil para liberar o acesso ao conteúdo completo.
            </p>
          </div>

          {/* Informações */}
          <div className="space-y-3 rounded-lg bg-prime-red/10 p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-prime-red flex-shrink-0 mt-0.5" />
              <div className="text-sm text-prime-cream/80">
                <p className="font-semibold text-white">E-mail registrado</p>
                <p className="text-xs mt-1">{session.user.email}</p>
              </div>
            </div>
          </div>

          {/* Próximos passos */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-white">O que acontece agora?</h2>
            <ol className="space-y-2 text-sm text-prime-cream/70">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-prime-red/20 text-xs font-bold text-prime-red flex-shrink-0">
                  1
                </span>
                <span>Nossa equipe revisará seu perfil</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-prime-red/20 text-xs font-bold text-prime-red flex-shrink-0">
                  2
                </span>
                <span>Você receberá um e-mail de confirmação</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-prime-red/20 text-xs font-bold text-prime-red flex-shrink-0">
                  3
                </span>
                <span>Acesso total ao conteúdo será liberado</span>
              </li>
            </ol>
          </div>

          {/* Ações */}
          <div className="space-y-3 pt-4">
            <p className="text-xs text-prime-cream/60 text-center">
              Tempo médio de análise: 24-48 horas
            </p>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-prime-red text-white font-semibold hover:bg-prime-red/90 transition-colors"
            >
              Fazer logout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Suporte */}
          <div className="text-center text-xs text-prime-cream/60 pt-4 border-t border-prime-cream/10">
            <p>
              Dúvidas?{' '}
              <a
                href="mailto:support@primedigitalhub.com"
                className="font-semibold text-prime-red hover:underline"
              >
                Entre em contato
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

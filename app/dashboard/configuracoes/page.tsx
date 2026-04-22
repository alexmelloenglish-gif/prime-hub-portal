import { getServerSession } from 'next-auth'
import { SectionShell } from '@/components/dashboard/section-shell'
import { authOptions } from '@/lib/auth'

export default async function DashboardSettingsPage() {
  const session = await getServerSession(authOptions)

  return (
    <SectionShell
      title="Configurações"
      description="Resumo da conta autenticada com Google e pronto para expansão futura do produto."
    >
      <article className="glass-card p-6">
        <h3 className="font-display text-xl font-semibold text-white">Conta conectada</h3>
        <dl className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-prime-cream/50">Nome</dt>
            <dd className="mt-1 text-sm text-white">{session?.user?.name ?? 'Não informado'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-prime-cream/50">E-mail</dt>
            <dd className="mt-1 text-sm text-white">{session?.user?.email ?? 'Não informado'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-prime-cream/50">Método de acesso</dt>
            <dd className="mt-1 text-sm text-white">Google OAuth</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-prime-cream/50">Perfil padrão</dt>
            <dd className="mt-1 text-sm text-white">{session?.user?.role ?? 'student'}</dd>
          </div>
        </dl>
      </article>
    </SectionShell>
  )
}

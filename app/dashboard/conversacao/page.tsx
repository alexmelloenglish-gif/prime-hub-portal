import { SectionShell } from '@/components/dashboard/section-shell'

const conversationBlocks = [
  {
    title: 'Prática guiada',
    description: 'Roteiros de speaking com foco em fluência, confiança e respostas naturais.',
  },
  {
    title: 'Correções acionáveis',
    description: 'Feedback simples para priorizar os próximos ajustes de pronúncia e vocabulário.',
  },
  {
    title: 'Rotina recomendada',
    description: '15 minutos diários de revisão oral para consolidar estruturas úteis.',
  },
]

export default function DashboardConversationPage() {
  return (
    <SectionShell
      title="Conversação"
      description="Espaço preparado para futuras integrações, mantendo a navegação estável já nesta versão."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {conversationBlocks.map((block) => (
          <article key={block.title} className="glass-card p-6">
            <h3 className="font-display text-xl font-semibold text-white">{block.title}</h3>
            <p className="mt-3 text-sm text-prime-cream/70">{block.description}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  )
}

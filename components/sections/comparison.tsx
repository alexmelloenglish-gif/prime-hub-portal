import { ArrowRight, Check, X } from 'lucide-react'

const commonSchoolPoints = [
  'Aula termina e parte do contexto se perde',
  'A próxima conversa depende de lembranças fragmentadas',
  'O aluno nem sempre enxerga o próximo foco',
  'O progresso fica difícil de acompanhar com clareza',
]

const primePoints = [
  'A aprendizagem relevante deixa evidências',
  'O professor interpreta o que elas significam e decide o próximo passo',
  'O professor transforma as evidências em orientação',
  'A próxima etapa ganha direção e personalização',
]

export function ComparisonSection() {
  return (
    <section className="relative z-10 container py-20">
      <div className="mb-16 max-w-3xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-prime-red">Antes e depois</p>
        <h2 className="mb-4 font-display text-3xl font-bold text-white md:text-4xl">Quando a educação lembra, o aluno assume a direção.</h2>
        <p className="text-lg leading-relaxed text-prime-cream/80">Não é sobre acumular dados. É sobre transformar cada aula em contexto para a próxima.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="glass-card p-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-prime-cream/45">Sem continuidade</p>
          <h3 className="mb-6 font-display text-2xl font-bold text-white">A aula fica para trás</h3>
          <ul className="space-y-4">
            {commonSchoolPoints.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                <span className="text-prime-cream/80">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card border-prime-red/50 bg-prime-red/10 p-8 shadow-[0_20px_60px_rgba(213,0,0,0.12)]">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-orange-200/70">Com o PRIME</p>
          <h3 className="mb-6 font-display text-2xl font-bold text-white">A aprendizagem continua</h3>
          <ul className="space-y-4">
            {primePoints.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" />
                <span className="text-prime-cream/85">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:gap-4">
        {['Aula', 'Evidência', 'Interpretação', 'Direção', 'Evolução'].map((stage, index, stages) => (
          <div key={stage} className="flex items-center gap-3 sm:gap-4">
            <span className="font-display text-2xl font-semibold text-white">{stage}</span>
            {index < stages.length - 1 ? <ArrowRight className="h-5 w-5 text-prime-red" /> : null}
          </div>
        ))}
      </div>
    </section>
  )
}

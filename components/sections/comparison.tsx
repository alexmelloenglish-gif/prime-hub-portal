import { ArrowRight, BookOpen, Brain, Check, Target, TrendingUp, X } from 'lucide-react'

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

const stages = [
  { label: 'Aula', icon: BookOpen },
  { label: 'Evidência', icon: Check },
  { label: 'Interpretação', icon: Brain },
  { label: 'Direção', icon: Target },
  { label: 'Evolução', icon: TrendingUp },
]

export function ComparisonSection() {
  return (
    <section id="comparativo" className="relative z-10 border-y border-slate-200 bg-[#f7fafd] py-16 sm:py-20">
      <div className="container">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-prime-red">Antes e depois</p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#0b2c5c] md:text-4xl">
            Quando a educação lembra, o aluno assume a direção.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            Não é sobre acumular dados. É sobre transformar cada aula em contexto para a próxima.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_14px_36px_rgba(14,43,82,0.05)] sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <X className="h-5 w-5 text-slate-500" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Sem continuidade</p>
                <h3 className="font-display text-2xl font-bold text-[#0b2c5c]">A aula fica para trás</h3>
              </div>
            </div>
            <ul className="space-y-4">
              {commonSchoolPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <X className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                  <span className="text-sm leading-6 text-slate-600">{point}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-red-100 bg-[linear-gradient(145deg,#fff7f7,#ffffff)] p-7 shadow-[0_18px_44px_rgba(168,34,23,0.08)] sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-prime-red">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-prime-red">Com o PRIME</p>
                <h3 className="font-display text-2xl font-bold text-prime-red">A aprendizagem continua</h3>
              </div>
            </div>
            <ul className="space-y-4">
              {primePoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-prime-red" />
                  <span className="text-sm leading-6 text-slate-700">{point}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="mt-10 overflow-x-auto pb-2">
          <div className="mx-auto flex min-w-[760px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            {stages.map(({ label, icon: Icon }, index) => (
              <div key={label} className="flex items-center">
                <div className="flex items-center gap-2 rounded-full px-4 py-2 text-[#123263]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef4fa]">
                    <Icon className="h-4 w-4 text-prime-red" />
                  </div>
                  <span className="font-display text-sm font-bold">{label}</span>
                </div>
                {index < stages.length - 1 ? <ArrowRight className="mx-1 h-5 w-5 text-[#7890ab]" /> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

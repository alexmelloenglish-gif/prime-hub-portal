import { ArrowRight, BookOpen, Brain, Check, Target, TrendingUp, X } from 'lucide-react'

const otherMethodsPersonImage = '/assets/other-methods-person.webp'
const primeContextPersonImage = '/assets/prime-context-person-hq.webp'

const commonSchoolPoints = [
  'A aula termina e parte do contexto se perde',
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
  { label: 'Aula', icon: BookOpen, text: 'Interações reais e personalizadas' },
  { label: 'Evidência', icon: Check, text: 'O que foi trabalhado fica registrado' },
  { label: 'Interpretação', icon: Brain, text: 'O professor identifica o próximo foco' },
  { label: 'Direção', icon: Target, text: 'Orientação clara e personalizada' },
  { label: 'Evolução', icon: TrendingUp, text: 'Cada aula constrói sobre a anterior' },
]

export function ComparisonSection() {
  return (
    <section id="comparativo" className="relative z-10 overflow-hidden border-y border-slate-200 bg-[#f7fafd] py-16 sm:py-20">
      <div className="container min-w-0">
        <div className="mb-10 max-w-4xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-prime-red">Antes e depois</p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#0b2c5c] md:text-4xl">
            Quando a educação lembra, o aluno assume a direção.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            Não é sobre acumular dados. É sobre transformar cada aula em contexto para a próxima.
          </p>
        </div>

        <div className="grid min-w-0 gap-5 lg:grid-cols-2">
          <article className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_36px_rgba(14,43,82,0.05)]">
            <div className="grid min-h-[340px] min-w-0 sm:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
              <div className="min-w-0 p-6 sm:p-8">
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <X className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 sm:tracking-[0.18em]">Em outras escolas e métodos</p>
                    <p className="mt-1 text-sm font-medium text-slate-500">Sem um professor acompanhando o contexto de forma contínua.</p>
                  </div>
                </div>
                <h3 className="font-display text-3xl font-bold text-[#0b2c5c]">A aula fica para trás.</h3>
                <ul className="mt-6 space-y-4">
                  {commonSchoolPoints.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <X className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                      <span className="min-w-0 break-words text-sm leading-6 text-slate-600">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative min-h-[280px] min-w-0 bg-slate-100 sm:min-h-full">
                <img src={otherMethodsPersonImage} alt="Aluna sem continuidade entre as aulas" className="absolute inset-0 h-full w-full object-cover grayscale" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/22 via-transparent to-white/10" />
              </div>
            </div>
          </article>

          <article className="min-w-0 overflow-hidden rounded-3xl border border-red-100 bg-white shadow-[0_18px_44px_rgba(168,34,23,0.08)]">
            <div className="grid min-h-[340px] min-w-0 sm:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
              <div className="min-w-0 p-6 sm:p-8">
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-prime-red">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-prime-red sm:tracking-[0.18em]">Aqui no Prime Digital Hub</p>
                    <p className="mt-1 text-sm font-semibold text-[#7f241c]">Com professor, contexto e continuidade entre as aulas.</p>
                  </div>
                </div>
                <h3 className="font-display text-3xl font-bold text-prime-red">A aprendizagem continua.</h3>
                <ul className="mt-6 space-y-4">
                  {primePoints.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-prime-red" />
                      <span className="min-w-0 break-words text-sm leading-6 text-slate-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative min-h-[300px] min-w-0 bg-[#eef4fa] sm:min-h-full">
                <img
                  src={primeContextPersonImage}
                  alt="Aluna do Prime Digital Hub estudando com contexto e continuidade"
                  className="absolute inset-0 h-full w-full object-cover object-center contrast-[1.03] brightness-[1.02] saturate-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b2c5c]/20 via-transparent to-white/5" />
                <div className="absolute right-4 top-4 max-w-[calc(100%-2rem)] rounded-2xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur">
                  <p className="font-display text-lg font-bold leading-tight text-[#0b2c5c]">Mais clareza.</p>
                  <p className="text-sm font-semibold text-prime-red">Mais progresso.</p>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div className="mt-10 min-w-0">
          <div className="mx-auto flex min-w-0 flex-col items-stretch rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-center">
            {stages.map(({ label, icon: Icon, text }, index) => (
              <div key={label} className="flex min-w-0 flex-1 flex-col items-center lg:flex-row">
                <div className="flex min-w-0 flex-1 flex-col items-center px-3 py-2 text-center text-[#123263]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4fa]">
                    <Icon className="h-5 w-5 text-prime-red" />
                  </div>
                  <span className="mt-3 font-display text-sm font-bold">{label}</span>
                  <span className="mt-1 max-w-[18rem] break-words text-xs leading-5 text-slate-500">{text}</span>
                </div>
                {index < stages.length - 1 ? (
                  <ArrowRight className="my-2 h-5 w-5 shrink-0 rotate-90 text-[#7890ab] lg:mx-1 lg:my-0 lg:rotate-0" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

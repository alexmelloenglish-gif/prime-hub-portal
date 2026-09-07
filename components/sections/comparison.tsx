import { ArrowRight, BookOpen, Brain, Check, Target, TrendingUp, X } from 'lucide-react'

const otherMethodsPersonImage = '/assets/other-methods-person.webp'
const primeContextPersonImage = 'data:image/webp;base64,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[...truncated...]'}
const officialLogo = '/brand/prime-digital-hub-full-transparent.png'

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
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#0b2c5c] md:text-4xl">Quando a educação lembra, o aluno assume a direção.</h2>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">Não é sobre acumular dados. É sobre transformar cada aula em contexto para a próxima.</p>
        </div>

        <div className="grid min-w-0 gap-5 lg:grid-cols-2">
          <article className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_36px_rgba(14,43,82,0.05)]">
            <div className="grid min-h-[340px] min-w-0 sm:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
              <div className="min-w-0 p-6 sm:p-8">
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100"><X className="h-5 w-5 text-slate-500" /></div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 sm:tracking-[0.18em]">Em outras escolas e métodos</p>
                    <p className="mt-1 text-sm font-medium text-slate-500">Sem um professor acompanhando o contexto de forma contínua.</p>
                  </div>
                </div>
                <h3 className="font-display text-3xl font-bold text-[#0b2c5c]">A aula fica para trás.</h3>
                <ul className="mt-6 space-y-4">
                  {commonSchoolPoints.map((point) => <li key={point} className="flex items-start gap-3"><X className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" /><span className="min-w-0 break-words text-sm leading-6 text-slate-600">{point}</span></li>)}
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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-prime-red"><Check className="h-5 w-5 text-white" /></div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-prime-red sm:tracking-[0.18em]">Aqui no Prime Digital Hub</p>
                    <p className="mt-1 text-sm font-semibold text-[#7f241c]">Com professor, contexto e continuidade entre as aulas.</p>
                  </div>
                </div>
                <h3 className="font-display text-3xl font-bold text-prime-red">A aprendizagem continua.</h3>
                <ul className="mt-6 space-y-4">
                  {primePoints.map((point) => <li key={point} className="flex items-start gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-prime-red" /><span className="min-w-0 break-words text-sm leading-6 text-slate-700">{point}</span></li>)}
                </ul>
              </div>
              <div className="relative min-h-[300px] min-w-0 overflow-hidden bg-[#eef4fa] sm:min-h-full">
                <img src={primeContextPersonImage} alt="Aluna do Prime Digital Hub estudando com contexto e continuidade" className="absolute inset-0 h-full w-full object-cover object-center contrast-[1.03] brightness-[1.02] saturate-[1.04]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b2c5c]/20 via-transparent to-white/5" />
                <div className="absolute left-4 top-4 rounded-2xl bg-white/94 px-3 py-2 shadow-lg backdrop-blur">
                  <img src={officialLogo} alt="Prime Digital Hub" className="h-auto w-28" />
                </div>
                <div className="absolute right-4 top-4 max-w-[calc(100%-2rem)] rounded-2xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur">
                  <p className="font-display text-lg font-bold leading-tight text-[#0b2c5c]">Mais clareza.</p>
                  <p className="text-sm font-semibold text-prime-red">Mais progresso.</p>
                  <p className="text-sm font-semibold text-[#0b2c5c]">Mais você.</p>
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4fa]"><Icon className="h-5 w-5 text-prime-red" /></div>
                  <span className="mt-3 font-display text-sm font-bold">{label}</span>
                  <span className="mt-1 max-w-[18rem] break-words text-xs leading-5 text-slate-500">{text}</span>
                </div>
                {index < stages.length - 1 ? <ArrowRight className="my-2 h-5 w-5 shrink-0 rotate-90 text-[#7890ab] lg:mx-1 lg:my-0 lg:rotate-0" /> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

import { Brain, BookOpen, Compass, History } from 'lucide-react'

const features = [
  {
    icon: BookOpen,
    title: 'Cada aula deixa evidências',
    description: 'O que foi trabalhado, praticado e descoberto em aula passa a fazer parte da sua jornada.',
  },
  {
    icon: Brain,
    title: 'Acompanhamento com contexto',
    description: 'O professor encontra o histórico certo para acompanhar sua evolução com atenção e consistência.',
  },
  {
    icon: Compass,
    title: 'Direção mais precisa',
    description: 'O professor interpreta os sinais da aprendizagem e decide o que merece atenção a seguir.',
  },
  {
    icon: History,
    title: 'O contexto acompanha você',
    description: 'A próxima aula começa com muito mais clareza sobre sua evolução, sem perder o que já foi construído.',
  },
]

export function FeaturesGrid() {
  return (
    <section id="como-funciona" className="relative z-10 border-y border-slate-200 bg-[#f7fafd] py-16 sm:py-20">
      <div id="metodo-prime" className="container scroll-mt-28">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-prime-red">O método PRIME</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#0b2c5c] md:text-4xl">Educação que lembra.</h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            O PRIME conecta cada encontro à sua história de aprendizagem — para que a sua escola continue com você entre uma aula e outra.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon

            return (
              <article
                key={feature.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_34px_rgba(14,43,82,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(14,43,82,0.09)]"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-sm font-bold tracking-[0.18em] text-[#7890ab]">0{index + 1}</span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef4fa] transition group-hover:bg-red-50">
                    <Icon className="h-6 w-6 text-[#123263] transition group-hover:text-prime-red" />
                  </div>
                </div>
                <h3 className="font-display text-xl font-bold leading-tight text-[#0b2c5c]">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

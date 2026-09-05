import { Brain, GraduationCap, Heart, History, ShieldCheck, UserRound } from 'lucide-react'

const values = [
  {
    icon: UserRound,
    title: 'O aluno no centro',
    description: 'Sua história, seus objetivos, seu contexto e sua evolução orientam a jornada.',
  },
  {
    icon: GraduationCap,
    title: 'Professor como autoridade',
    description: 'O professor interpreta as evidências, valida os sinais e decide a direção pedagógica.',
  },
  {
    icon: Brain,
    title: 'Tecnologia nos bastidores',
    description: 'Um sistema de inteligência de aprendizagem organiza o contexto para que o professor possa se concentrar em você.',
  },
  {
    icon: History,
    title: 'Memória persistente',
    description: 'O aprendizado relevante permanece acessível para que cada aula possa construir sobre a anterior.',
  },
  {
    icon: ShieldCheck,
    title: 'Mais transparência',
    description: 'Você entende o que foi trabalhado, o que está evoluindo e qual é o próximo foco.',
  },
  {
    icon: Heart,
    title: 'Acompanhamento humano',
    description: 'Tecnologia e cuidado trabalham juntos para tornar o ensino mais atento, pessoal e consistente.',
  },
]

export function WhyPrimeSection() {
  return (
    <section id="diferenciais" className="relative z-10 bg-white py-16 sm:py-20">
      <div className="container">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-prime-red">O que torna o PRIME diferente</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#0b2c5c] md:text-4xl">Uma escola que continua com você.</h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            O professor continua sendo a autoridade. A tecnologia trabalha nos bastidores para preservar o contexto da sua jornada e tornar cada encontro mais atento, pessoal e consistente.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {values.map((value, index) => {
            const Icon = value.icon
            const accent = index === 0 || index === 5

            return (
              <article
                key={value.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(14,43,82,0.045)]"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent ? 'bg-red-50' : 'bg-[#eef4fa]'}`}>
                    <Icon className={`h-6 w-6 ${accent ? 'text-prime-red' : 'text-[#123263]'}`} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#0b2c5c]">{value.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{value.description}</p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

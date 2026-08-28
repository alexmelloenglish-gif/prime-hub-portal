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
    <section className="relative z-10 container py-20">
      <div className="mb-16 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-prime-red">O que torna o PRIME diferente</p>
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">Uma escola que continua com você.</h2>
        </div>
        <p className="max-w-2xl text-lg leading-relaxed text-prime-cream/80">
          O professor continua sendo a autoridade. A tecnologia trabalha nos bastidores para preservar o contexto da sua jornada e tornar cada encontro mais atento, pessoal e consistente.
        </p>
      </div>

      <div className="grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {values.map((value) => {
          const Icon = value.icon

          return (
            <div key={value.title} className="space-y-4 border-t border-white/10 pt-5">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-prime-red/15">
                <Icon className="h-6 w-6 text-prime-red" />
              </div>
              <h3 className="font-display text-xl font-semibold text-white">{value.title}</h3>
              <p className="leading-7 text-prime-cream/70">{value.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

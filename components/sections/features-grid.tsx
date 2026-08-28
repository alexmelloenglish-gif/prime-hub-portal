import { Brain, BookOpen, Compass, History } from 'lucide-react'

const features = [
  {
    icon: BookOpen,
    title: 'Cada aula deixa evidências',
    description: 'O que foi trabalhado, praticado e descoberto em aula passa a fazer parte da sua jornada.',
  },
  {
    icon: Brain,
    title: 'Inteligência como assistência',
    description: 'A IA organiza o contexto e amplia a memória do professor, sem substituir sua autoridade pedagógica.',
  },
  {
    icon: Compass,
    title: 'Direção mais precisa',
    description: 'O professor interpreta os sinais da aprendizagem e decide o que merece atenção a seguir.',
  },
  {
    icon: History,
    title: 'Memória que permanece',
    description: 'A próxima aula começa com muito mais contexto, personalização e clareza sobre sua evolução.',
  },
]

export function FeaturesGrid() {
  return (
    <section id="como-funciona" className="relative z-10 container py-20">
      <div className="mb-16 max-w-3xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-prime-red">O método PRIME</p>
        <h2 className="mb-4 font-display text-3xl font-bold text-white md:text-4xl">Educação que lembra.</h2>
        <p className="text-lg leading-relaxed text-prime-cream/80">
          O PRIME conecta cada encontro à sua história de aprendizagem — com tecnologia assistindo o professor e o aluno no centro de tudo.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => {
          const Icon = feature.icon

          return (
            <div key={feature.title} className="glass-card relative p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/15">
              <span className="mb-5 block text-xs font-semibold tracking-[0.2em] text-prime-cream/40">0{index + 1}</span>
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-prime-red/15">
                <Icon className="h-6 w-6 text-prime-red" />
              </div>
              <h3 className="mb-2 font-display text-xl font-semibold text-white">{feature.title}</h3>
              <p className="text-sm leading-6 text-prime-cream/70">{feature.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

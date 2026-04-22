import { BookOpen, TrendingUp, Target, MessageCircle } from 'lucide-react'

const features = [
  {
    icon: BookOpen,
    title: 'Minhas aulas',
    description: 'Acesse suas aulas ao vivo e gravadas a qualquer momento.',
  },
  {
    icon: TrendingUp,
    title: 'Meu progresso',
    description: 'Acompanhe sua evolução com métricas claras e objetivas.',
  },
  {
    icon: Target,
    title: 'Metas semanais',
    description: 'Defina e conquiste objetivos personalizados de aprendizado.',
  },
  {
    icon: MessageCircle,
    title: 'Conversação',
    description: 'Pratique speaking com exercícios interativos e feedback.',
  },
]

export function FeaturesGrid() {
  return (
    <section id="diferenciais" className="relative z-10 container py-20">
      <div className="mb-16 text-center">
        <h2 className="mb-4 font-display text-3xl font-bold text-white md:text-4xl">Tudo que você precisa em um só lugar</h2>
        <p className="text-lg text-prime-cream/80">Um portal completo para acompanhar sua jornada de aprendizado de inglês</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon

          return (
            <div key={feature.title} className="glass-card p-6 transition-all duration-300 hover:bg-white/15">
              <Icon className="mb-4 h-8 w-8 text-prime-red" />
              <h3 className="mb-2 font-display text-xl font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-prime-cream/70">{feature.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

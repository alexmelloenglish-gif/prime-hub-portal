'use client'

import { BookOpen, TrendingUp, Target, MessageCircle } from 'lucide-react'

const features = [
  {
    icon: BookOpen,
    title: 'Minhas Aulas',
    description: 'Acesse suas aulas ao vivo e gravadas a qualquer momento.',
  },
  {
    icon: TrendingUp,
    title: 'Meu Progresso',
    description: 'Acompanhe sua evolução com métricas claras e objetivas.',
  },
  {
    icon: Target,
    title: 'Metas Semanais',
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
    <section className="relative z-10 container py-20">
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
          Tudo que você precisa em um só lugar
        </h2>
        <p className="text-lg text-prime-cream/80">
          Um portal completo para acompanhar sua jornada de aprendizado de inglês
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <div key={feature.title} className="glass-card p-6 hover:bg-white/15 transition-all duration-300">
              <Icon className="h-8 w-8 text-prime-red mb-4" />
              <h3 className="font-display text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-prime-cream/70 text-sm">
                {feature.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

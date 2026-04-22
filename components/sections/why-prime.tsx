import { Brain, Users, Globe, Sparkles, GraduationCap, Heart } from 'lucide-react'

const values = [
  {
    icon: Brain,
    title: 'Neurociência aplicada',
    description: 'Metodologia baseada em como o cérebro realmente aprende idiomas, com técnicas de memorização e retenção comprovadas.',
  },
  {
    icon: Users,
    title: 'Acompanhamento personalizado',
    description: 'Cada aluno é único. Os professores adaptam o conteúdo ao seu ritmo, objetivos e estilo de aprendizado.',
  },
  {
    icon: Globe,
    title: '100% online e flexível',
    description: 'Estude de qualquer lugar, no seu tempo. Aulas ao vivo, materiais gravados e suporte sempre disponíveis.',
  },
  {
    icon: Sparkles,
    title: 'Aprendizado consciente',
    description: 'Mais do que decorar regras: entender o porquê. Desenvolvemos autonomia para pensar em inglês.',
  },
  {
    icon: GraduationCap,
    title: 'Professores especialistas',
    description: 'Equipe com formação sólida e experiência internacional, focada em resultados reais e duradouros.',
  },
  {
    icon: Heart,
    title: 'Comunidade engajada',
    description: 'Faça parte de um grupo de alunos motivados, com eventos, desafios e suporte mútuo na jornada.',
  },
]

export function WhyPrimeSection() {
  return (
    <section className="relative z-10 container py-20">
      <div className="mb-16 text-center">
        <h2 className="mb-4 font-display text-3xl font-bold text-white md:text-4xl">Por que a Prime Digital Hub?</h2>
        <p className="mx-auto max-w-2xl text-lg text-prime-cream/80">
          Somos mais do que uma escola de idiomas. Somos um ecossistema completo de aprendizado, onde tecnologia,
          neurociência e acompanhamento humano se unem para transformar seu inglês.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {values.map((value) => {
          const Icon = value.icon

          return (
            <div key={value.title} className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-prime-red/20">
                <Icon className="h-6 w-6 text-prime-red" />
              </div>
              <h3 className="font-display text-xl font-semibold text-white">{value.title}</h3>
              <p className="text-prime-cream/70">{value.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

'use client'

import { X, Check } from 'lucide-react'

const commonSchoolPoints = [
  'Aulas soltas e pouco direcionamento',
  'Pouca visibilidade da própria evolução',
  'Ambiente pouco estimulante',
  'Navegação confusa',
]

const primePoints = [
  'Trilhas de aprendizado claras e guiadas',
  'Métricas reais de evolução',
  'Ambiente pensado para aprender melhor',
  'Navegação intuitiva e fluida',
]

export function ComparisonSection() {
  return (
    <section className="relative z-10 container py-20">
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
          Escolas Comuns x Prime Digital Hub
        </h2>
        <p className="text-lg text-prime-cream/80">
          Como a Prime transforma o jeito de aprender
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Common Schools */}
        <div className="glass-card p-8">
          <h3 className="font-display text-2xl font-bold text-white mb-6">
            Escolas Comuns
          </h3>
          <ul className="space-y-4">
            {commonSchoolPoints.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-prime-cream/80">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Prime Digital Hub */}
        <div className="glass-card p-8 border-prime-red/50">
          <h3 className="font-display text-2xl font-bold text-white mb-6">
            Prime Digital Hub
          </h3>
          <ul className="space-y-4">
            {primePoints.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-prime-cream/80">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-8 mt-16">
        <div className="text-center">
          <div className="font-display text-4xl font-bold text-prime-red mb-2">40%</div>
          <p className="text-prime-cream/80">Mais retenção de conteúdo</p>
        </div>
        <div className="text-center">
          <div className="font-display text-4xl font-bold text-prime-red mb-2">3x</div>
          <p className="text-prime-cream/80">Mais engajamento com trilhas</p>
        </div>
        <div className="text-center">
          <div className="font-display text-4xl font-bold text-prime-red mb-2">+500</div>
          <p className="text-prime-cream/80">Alunos transformados</p>
        </div>
      </div>
    </section>
  )
}

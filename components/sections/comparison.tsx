import { Check, X } from 'lucide-react'

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
      <div className="mb-16 text-center">
        <h2 className="mb-4 font-display text-3xl font-bold text-white md:text-4xl">Escolas comuns x Prime Digital Hub</h2>
        <p className="text-lg text-prime-cream/80">Como a Prime transforma o jeito de aprender</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="glass-card p-8">
          <h3 className="mb-6 font-display text-2xl font-bold text-white">Escolas comuns</h3>
          <ul className="space-y-4">
            {commonSchoolPoints.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                <span className="text-prime-cream/80">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card border-prime-red/50 p-8">
          <h3 className="mb-6 font-display text-2xl font-bold text-white">Prime Digital Hub</h3>
          <ul className="space-y-4">
            {primePoints.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <span className="text-prime-cream/80">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        <div className="text-center">
          <div className="mb-2 font-display text-4xl font-bold text-prime-red">40%</div>
          <p className="text-prime-cream/80">Mais retenção de conteúdo</p>
        </div>
        <div className="text-center">
          <div className="mb-2 font-display text-4xl font-bold text-prime-red">3x</div>
          <p className="text-prime-cream/80">Mais engajamento com trilhas</p>
        </div>
        <div className="text-center">
          <div className="mb-2 font-display text-4xl font-bold text-prime-red">+500</div>
          <p className="text-prime-cream/80">Alunos transformados</p>
        </div>
      </div>
    </section>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import { ChevronRight, Shield } from 'lucide-react'

interface HeroSectionProps {
  onEnterPortal: () => void
}

export function HeroSection({ onEnterPortal }: HeroSectionProps) {
  return (
    <section className="relative z-10 container pt-12 pb-24">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Copy */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-prime-red/20 text-orange-400 px-4 py-2 rounded-full text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-prime-red opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-prime-red"></span>
            </span>
            Agora 100% Online
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Sua escola de idiomas{' '}
            <span className="text-prime-red">evoluiu</span>.
          </h1>

          <p className="text-lg md:text-xl text-prime-cream/80 max-w-xl leading-relaxed">
            Bem-vindo ao <strong className="text-white">Prime Digital Hub</strong>, seu ecossistema de aprendizado 100% online, feito para acompanhar seu progresso em inglês com clareza e propósito.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={onEnterPortal}
              className="bg-prime-red hover:bg-red-700 text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-prime-red/30"
            >
              Acessar Meu Portal
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 rounded-full px-8 py-6 text-base font-semibold"
            >
              Conhecer a Prime
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-prime-cream/60">
            <Shield className="h-4 w-4" />
            <span>Ambiente seguro para alunos da Prime Digital Hub</span>
          </div>
        </div>

        {/* Right: Dashboard Preview Card */}
        <div className="glass-card shadow-2xl border-white/10 p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-14 w-14 rounded-2xl bg-prime-red flex items-center justify-center text-white text-2xl font-display font-bold shadow-lg shadow-prime-red/30">
              P
            </div>
            <div>
              <h2 className="text-2xl font-display font-semibold text-white">Prime Digital Hub</h2>
              <p className="text-prime-cream/70">Portal Acadêmico do Aluno</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="rounded-2xl bg-white/10 p-4 hover:bg-white/15 transition-colors cursor-pointer">
              <p className="text-sm text-prime-cream/60 mb-1">Próxima aula</p>
              <p className="text-lg font-medium text-white">Speaking & Confidence</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 hover:bg-white/15 transition-colors cursor-pointer">
              <p className="text-sm text-prime-cream/60 mb-1">Seu progresso</p>
              <p className="text-lg font-medium text-white">68% completo</p>
              <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-prime-red rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 hover:bg-white/15 transition-colors cursor-pointer">
              <p className="text-sm text-prime-cream/60 mb-1">Material novo</p>
              <p className="text-lg font-medium text-white">Liberado hoje</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 hover:bg-white/15 transition-colors cursor-pointer">
              <p className="text-sm text-prime-cream/60 mb-1">Meta da semana</p>
              <p className="text-lg font-medium text-white">Conversação</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-prime-cream/60">Agora 100% Online</span>
            <span className="text-prime-cream/60">100% Digital</span>
          </div>
        </div>
      </div>
    </section>
  )
}

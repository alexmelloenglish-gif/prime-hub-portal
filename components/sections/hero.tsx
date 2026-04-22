import Link from 'next/link'
import { ChevronRight, Shield } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeroSectionProps {
  portalHref: string
}

export function HeroSection({ portalHref }: HeroSectionProps) {
  return (
    <section className="relative z-10 container pb-24 pt-12">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-prime-red/20 px-4 py-2 text-sm font-medium text-orange-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-prime-red opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-prime-red"></span>
            </span>
            Agora 100% online
          </div>

          <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Sua escola de idiomas <span className="text-prime-red">evoluiu</span>.
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-prime-cream/80 md:text-xl">
            Bem-vindo ao <strong className="text-white">Prime Digital Hub</strong>, seu ecossistema de aprendizado 100%
            online, feito para acompanhar seu progresso em inglês com clareza e propósito.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href={portalHref}
              className={cn(
                buttonVariants({ size: 'lg' }),
                'rounded-full bg-prime-red px-8 py-6 text-base font-semibold text-white shadow-lg shadow-prime-red/30 hover:bg-red-700'
              )}
            >
              Acessar meu portal
              <ChevronRight className="ml-2 inline-flex h-5 w-5" />
            </Link>
            <a
              href="#diferenciais"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'rounded-full border-white/20 px-8 py-6 text-base font-semibold text-white hover:bg-white/10 hover:text-white'
              )}
            >
              Conhecer a Prime
            </a>
          </div>

          <div className="flex items-center gap-2 text-sm text-prime-cream/60">
            <Shield className="h-4 w-4" />
            <span>Ambiente seguro para alunos da Prime Digital Hub</span>
          </div>
        </div>

        <div className="glass-card border-white/10 p-8 shadow-2xl">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-prime-red text-2xl font-bold text-white shadow-lg shadow-prime-red/30">
              P
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold text-white">Prime Digital Hub</h2>
              <p className="text-prime-cream/70">Portal acadêmico do aluno</p>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-4">
            <div className="cursor-pointer rounded-2xl bg-white/10 p-4 transition-colors hover:bg-white/15">
              <p className="mb-1 text-sm text-prime-cream/60">Próxima aula</p>
              <p className="text-lg font-medium text-white">Speaking & Confidence</p>
            </div>
            <div className="cursor-pointer rounded-2xl bg-white/10 p-4 transition-colors hover:bg-white/15">
              <p className="mb-1 text-sm text-prime-cream/60">Seu progresso</p>
              <p className="text-lg font-medium text-white">68% completo</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-prime-red" style={{ width: '68%' }}></div>
              </div>
            </div>
            <div className="cursor-pointer rounded-2xl bg-white/10 p-4 transition-colors hover:bg-white/15">
              <p className="mb-1 text-sm text-prime-cream/60">Material novo</p>
              <p className="text-lg font-medium text-white">Liberado hoje</p>
            </div>
            <div className="cursor-pointer rounded-2xl bg-white/10 p-4 transition-colors hover:bg-white/15">
              <p className="mb-1 text-sm text-prime-cream/60">Meta da semana</p>
              <p className="text-lg font-medium text-white">Conversação</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-prime-cream/60">Agora 100% online</span>
            <span className="text-prime-cream/60">100% digital</span>
          </div>
        </div>
      </div>
    </section>
  )
}

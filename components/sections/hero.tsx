import Link from 'next/link'
import { BookOpen, CalendarCheck, ChevronRight, MessageCircle, Shield, Sparkles, Target } from 'lucide-react'
import { BrandLogo } from '@/components/layout/brand-logo'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeroSectionProps {
  portalHref: string
}

export function HeroSection({ portalHref }: HeroSectionProps) {
  return (
    <section className="relative z-10 container pb-24 pt-12">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-prime-red/30 bg-prime-red/15 px-4 py-2 text-sm font-medium text-orange-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-prime-red opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-prime-red" />
            </span>
            Prime Digital Hub · Seu ecossistema de aprendizagem
          </div>

          <div className="space-y-5">
            <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-[1.04] tracking-tight md:text-5xl lg:text-6xl">
              Sua escola de inglês <span className="text-prime-red">continua evoluindo.</span>
              <span className="block text-prime-cream/90">Aprendizagem que permanece.</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-prime-cream/80 md:text-xl">
              Cada aula se conecta à próxima porque o seu aprendizado não começa de novo. O professor acompanha sua trajetória, registra o que realmente importa
              e transforma cada encontro em um passo claro para a sua evolução.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href={portalHref}
              className={cn(
                buttonVariants({ size: 'lg' }),
                'rounded-full bg-prime-red px-8 py-6 text-base font-semibold text-white shadow-lg shadow-prime-red/30 hover:bg-red-700'
              )}
            >
              Conhecer o método PRIME
              <ChevronRight className="ml-2 inline-flex h-5 w-5" />
            </Link>
            <a
              href="#como-funciona"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'rounded-full border-white/20 px-8 py-6 text-base font-semibold text-white hover:bg-white/10 hover:text-white'
              )}
            >
              Como funciona
            </a>
          </div>

          <div className="flex items-center gap-2 text-sm text-prime-cream/60">
            <Shield className="h-4 w-4 text-prime-red" />
            <span>O professor continua sendo a autoridade pedagógica.</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 rounded-full bg-prime-red/10 blur-3xl" aria-hidden="true" />
          <div className="glass-card relative overflow-hidden border-white/10 p-5 shadow-2xl sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="rounded-2xl bg-white p-1.5 shadow-lg shadow-prime-red/25">
                  <BrandLogo variant="mark" className="h-12 w-12" priority />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/50">Prime Digital Hub</p>
                  <h2 className="mt-1 font-display text-xl font-semibold text-white sm:text-2xl">Sua aprendizagem, com o seu contexto</h2>
                </div>
              </div>
              <Sparkles className="hidden h-5 w-5 shrink-0 text-prime-red sm:block" />
            </div>

            <div className="mb-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-prime-cream/70">
                  <CalendarCheck className="h-4 w-4 text-prime-red" />
                  Próxima aula
                </div>
                <span className="rounded-full bg-prime-red/15 px-3 py-1 text-xs font-medium text-orange-100">Mais contexto</span>
              </div>
              <p className="text-lg font-semibold text-white">A próxima aula não começa do zero.</p>
              <p className="mt-1 text-sm leading-6 text-prime-cream/60">
                Ela começa com a memória do que foi trabalhado, observado e direcionado pelo professor.
              </p>
            </div>

            <div className="relative space-y-3">
              {[
                { icon: BookOpen, label: 'Aula', text: 'Interações reais e decisões pedagógicas' },
                { icon: Sparkles, label: 'Memória da aprendizagem', text: 'O que importa permanece para a próxima aula' },
                { icon: Target, label: 'Direção do professor', text: 'O próximo foco ganha clareza' },
              ].map(({ icon: Icon, label, text }, index) => (
                <div key={label} className="relative flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-prime-red/15">
                    <Icon className="h-5 w-5 text-prime-red" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="mt-1 text-xs leading-5 text-prime-cream/60">{text}</p>
                  </div>
                  {index < 2 ? <span className="absolute -bottom-3 left-[1.9rem] z-10 h-3 border-l border-dashed border-prime-red/50" aria-hidden="true" /> : null}
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-prime-red/20 bg-prime-red/10 p-4">
              <div className="flex items-start gap-3">
                <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-prime-red" />
                <p className="text-sm leading-6 text-prime-cream/80">
                  <span className="font-semibold text-white">Faça cada aula contar.</span> A memória permanece; a evolução ganha direção.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

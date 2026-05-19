import Link from 'next/link'
import { BookOpen, CalendarCheck, ChevronRight, MessageCircle, Shield, Target } from 'lucide-react'
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

          <h1 className="font-display text-4xl font-extrabold tracking-tight leading-tight md:text-5xl lg:text-6xl">
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

        <div className="glass-card border-white/10 p-4 shadow-2xl sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <img
                src="/assets/logo-mini.png"
                alt="Prime"
                className="h-14 w-14 object-contain shadow-lg shadow-prime-red/30"
              />
              <div className="min-w-0">
                <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">Prime Digital Hub</h2>
                <p className="text-sm text-prime-cream/70 sm:text-base">Portal acadêmico do aluno</p>
              </div>
            </div>
            <span className="hidden rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100 sm:inline-flex">
              Online
            </span>
          </div>

          <div className="mb-4 rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-prime-cream/70">
                <CalendarCheck className="h-4 w-4 text-prime-red" />
                Próxima aula
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-prime-cream/70">Hoje</span>
            </div>
            <p className="text-lg font-semibold text-white">Speaking & Confidence</p>
            <p className="mt-1 text-sm text-prime-cream/60">19:00 - foco em conversação guiada</p>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white/10 p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-prime-red/20">
                <Target className="h-5 w-5 text-prime-red" />
              </div>
              <p className="text-sm text-prime-cream/60">Meta</p>
              <p className="mt-1 font-semibold text-white">Conversação</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-sky-400/15">
                <BookOpen className="h-5 w-5 text-sky-200" />
              </div>
              <p className="text-sm text-prime-cream/60">Material</p>
              <p className="mt-1 font-semibold text-white">Liberado</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-300/15">
                <MessageCircle className="h-5 w-5 text-amber-100" />
              </div>
              <p className="text-sm text-prime-cream/60">Feedback</p>
              <p className="mt-1 font-semibold text-white">Atualizado</p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-medium text-white">Progresso da jornada</span>
              <span className="text-prime-cream/60">68%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-prime-red" style={{ width: '68%' }}></div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-prime-cream/50">
              <span>Vocabulário</span>
              <span>Fluência</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

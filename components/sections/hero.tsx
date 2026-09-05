import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  History,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react'
import { BrandLogo } from '@/components/layout/brand-logo'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeroSectionProps {
  portalHref: string
}

const bookingHref = 'https://calendar.app.google/z1N7yrhvrVr6WyfFA'

const flow = [
  {
    icon: BookOpen,
    label: 'Aula',
    text: 'Interações reais e decisões pedagógicas',
  },
  {
    icon: History,
    label: 'Memória da aprendizagem',
    text: 'O que importa permanece para a próxima aula',
  },
  {
    icon: Target,
    label: 'Direção do professor',
    text: 'O próximo foco ganha clareza',
  },
]

export function HeroSection({ portalHref }: HeroSectionProps) {
  return (
    <section id="inicio" className="relative overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute right-[-10rem] top-[-8rem] h-[34rem] w-[34rem] rounded-full bg-[#eaf2fb] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-[-12rem] top-[28rem] h-[28rem] w-[28rem] rounded-full bg-red-50 blur-3xl"
        aria-hidden="true"
      />

      <div className="container relative z-10 grid items-center gap-12 pb-16 pt-10 lg:grid-cols-[0.98fr_1.02fr] lg:pb-20 lg:pt-16">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#244571] sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-prime-red" />
            Prime Digital Hub · Seu ecossistema de aprendizagem
          </div>

          <div className="space-y-5">
            <h1 className="max-w-3xl font-display text-[2.65rem] font-extrabold leading-[0.98] tracking-[-0.035em] text-[#0b2c5c] sm:text-5xl lg:text-[4.3rem]">
              Sua escola de inglês continua evoluindo.
              <span className="mt-2 block text-prime-red">Aprendizagem que permanece.</span>
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Cada aula se conecta à próxima porque o seu aprendizado não começa de novo. O professor acompanha sua trajetória,
              registra o que realmente importa e transforma cada encontro em um passo claro para a sua evolução.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="#metodo-prime"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'rounded-full bg-prime-red px-7 py-6 text-base font-semibold text-white shadow-[0_18px_42px_rgba(168,34,23,0.22)] hover:bg-red-700'
              )}
            >
              Conhecer o método PRIME
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <a
              href={bookingHref}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'rounded-full border-[#123263]/25 bg-white px-7 py-6 text-base font-semibold text-[#123263] shadow-sm hover:bg-[#f5f8fc] hover:text-[#123263]'
              )}
            >
              <CalendarCheck className="mr-2 h-5 w-5" />
              Agende sua aula experimental grátis
            </a>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-2 text-sm font-medium text-[#274566]">
              <ShieldCheck className="h-5 w-5 text-prime-red" />
              O professor continua sendo a autoridade pedagógica.
            </div>
            <Link href={portalHref} className="text-sm font-semibold text-[#123263] underline-offset-4 hover:text-prime-red hover:underline">
              Já sou aluno: acessar portal
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[2.5rem] bg-[radial-gradient(circle_at_top_right,rgba(168,34,23,0.11),transparent_38%),linear-gradient(135deg,#eef5fb,#ffffff_55%,#f8fbff)] shadow-[0_40px_100px_rgba(14,43,82,0.10)]" />
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 p-5 shadow-[0_28px_80px_rgba(14,43,82,0.12)] sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-prime-red">Sua aprendizagem, com o seu contexto</p>
                <h2 className="mt-2 max-w-md font-display text-2xl font-bold leading-tight text-[#0b2c5c] sm:text-3xl">
                  A próxima aula não começa do zero.
                </h2>
              </div>
              <BrandLogo variant="mark" className="h-14 w-14 shrink-0" />
            </div>

            <div className="mb-5 rounded-2xl border border-[#dce7f3] bg-[#f6f9fd] p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#123263]">
                  <CalendarCheck className="h-5 w-5 text-prime-red" />
                  Próxima aula
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-prime-red shadow-sm">Mais contexto</span>
              </div>
              <p className="text-sm leading-6 text-slate-600">
                Ela começa com a memória do que foi trabalhado, observado e direcionado pelo professor.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {flow.map(({ icon: Icon, label, text }, index) => (
                <div key={label} className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(14,43,82,0.06)]">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef4fa]">
                    <Icon className="h-5 w-5 text-[#123263]" />
                  </div>
                  <p className="text-sm font-bold leading-5 text-[#0b2c5c]">{label}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{text}</p>
                  {index < flow.length - 1 ? (
                    <ArrowRight className="absolute -right-[1.1rem] top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-prime-red sm:block" />
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="rounded-2xl bg-[#0b2c5c] p-5 text-white">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#ffcece]" />
                  <div>
                    <p className="font-display text-lg font-bold">Faça cada aula contar.</p>
                    <p className="mt-1 text-sm leading-6 text-white/75">A memória permanece; a evolução ganha direção.</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center text-[#123263] shadow-sm sm:flex-col">
                <GraduationCap className="h-6 w-6 text-prime-red" />
                <span className="text-xs font-bold uppercase tracking-[0.15em]">Learn · Improve · Belong</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

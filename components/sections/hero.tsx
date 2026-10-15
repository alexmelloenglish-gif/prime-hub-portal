import { ArrowRight, CalendarCheck, CheckCircle2 } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const heroStudentImage = '/assets/prime-hero-student-hq.webp'

const bookingHref = 'https://calendar.app.google/z1N7yrhvrVr6WyfFA'

const reassuranceItems = [
  'Aulas ao vivo e online',
  'Diagnóstico inicial de nível e objetivo',
  'Acompanhamento do professor',
]

export function HeroSection() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute right-[-10rem] top-[-8rem] h-[34rem] w-[34rem] rounded-full bg-[#eaf2fb] blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute left-[-12rem] top-[28rem] h-[28rem] w-[28rem] rounded-full bg-red-50 blur-3xl" aria-hidden="true" />

      <div className="container relative z-10 grid min-w-0 items-center gap-10 pb-14 pt-8 lg:grid-cols-[0.93fr_1.07fr] lg:pb-18 lg:pt-12">
        <div className="min-w-0 space-y-6">
          <div className="inline-flex max-w-full items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#244571] sm:text-sm sm:tracking-[0.22em]">
            <span className="h-2 w-2 shrink-0 rounded-full bg-prime-red" />
            Prime Digital Hub · Inglês online ao vivo
          </div>

          <div className="space-y-5">
            <h1 className="max-w-3xl font-display text-[2.45rem] font-extrabold leading-[0.98] tracking-[-0.035em] text-[#0b2c5c] sm:text-5xl lg:text-[4.3rem]">
              Aulas de inglês online ao vivo para objetivos reais.
            </h1>
            <div className="h-1.5 w-28 rounded-full bg-prime-red" />
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Pratique o inglês para a escola, o trabalho ou o dia a dia, com acompanhamento atento ao que você já consegue fazer e ao que precisa desenvolver.
            </p>
          </div>

          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={bookingHref}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'h-auto min-h-12 w-full min-w-0 max-w-full whitespace-normal rounded-full border border-[#1565D8] bg-[#1565D8] px-6 py-3 text-center text-base font-semibold leading-5 text-white shadow-[0_18px_42px_rgba(21,101,216,0.22)] hover:bg-[#0f56bd] hover:text-white sm:w-auto sm:px-7'
              )}
            >
              <CalendarCheck className="mr-2 h-5 w-5 shrink-0" />
              Agendar aula experimental grátis
            </a>
            <a
              href="#como-funciona"
              className={cn(
                buttonVariants({ size: 'lg', variant: 'outline' }),
                'h-auto min-h-12 w-full min-w-0 max-w-full whitespace-normal rounded-full border-[#123263]/20 bg-white px-6 py-3 text-center text-base font-semibold leading-5 text-[#123263] hover:bg-slate-50 hover:text-[#123263] sm:w-auto sm:px-7'
              )}
            >
              Conheça como funciona
              <ArrowRight className="ml-2 h-5 w-5 shrink-0" />
            </a>
          </div>

          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Conversa inicial + diagnóstico de nível e objetivos + uma experiência de aula ajustada ao seu momento.
          </p>

          <div className="grid gap-2.5 border-t border-slate-200 pt-5 sm:grid-cols-3 sm:gap-3">
            {reassuranceItems.map((item) => (
              <div key={item} className="flex items-start gap-2.5 rounded-xl bg-[#f7fafd] px-3.5 py-3 text-sm font-semibold leading-5 text-[#244571]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1565D8]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-w-0">
          <div className="absolute -inset-5 rounded-[2.5rem] bg-[radial-gradient(circle_at_top_right,rgba(168,34,23,0.10),transparent_38%),linear-gradient(135deg,#eef5fb,#ffffff_55%,#f8fbff)] shadow-[0_40px_100px_rgba(14,43,82,0.10)]" />
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(14,43,82,0.12)]">
            <img
              src={heroStudentImage}
              alt="Aluna estudando inglês online no Prime Digital Hub"
              width={958}
              height={860}
              className="h-auto w-full contrast-[1.04] brightness-[1.03] saturate-[1.05]"
            />
            <div className="border-t border-slate-100 bg-white px-5 py-4 text-center sm:px-6">
              <p className="font-display text-lg font-bold tracking-[-0.01em] text-[#0b2c5c] sm:text-xl">Cada aula ajuda a preparar melhor a próxima.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

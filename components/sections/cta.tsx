import { ArrowRight, Brain, CalendarCheck, GraduationCap } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const communityImage = '/assets/prime-cta-community-hq.webp'

interface CTASectionProps { portalHref: string }

const whatsappHref =
  'https://api.whatsapp.com/send/?phone=5521965147515&text=Oi%21+Gostaria+de%20falar%20com%20a%20Prime%20Digital%20Hub.&type=phone_number&app_absent=0'
const trialLessonHref = 'https://calendar.app.google/z1N7yrhvrVr6WyfFA'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.07 2C6.59 2 2.12 6.46 2.12 11.96c0 1.76.46 3.48 1.34 5L2 22l5.2-1.36a9.9 9.9 0 0 0 4.75 1.21h.01c5.47 0 9.93-4.46 9.93-9.95 0-2.65-1.03-5.14-2.84-6.99Zm-6.98 15.25h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.09.81.83-3.01-.2-.31a8.23 8.23 0 0 1-1.27-4.36c0-4.56 3.7-8.27 8.25-8.27 2.2 0 4.26.86 5.81 2.43a8.16 8.16 0 0 1 2.4 5.84c0 4.55-3.7 8.25-8.24 8.25Zm4.53-6.17c-.25-.13-1.49-.74-1.72-.82-.23-.08-.39-.13-.56.13-.16.25-.64.82-.79.99-.15.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.26a7.42 7.42 0 0 1-1.38-1.72c-.14-.25-.02-.39.11-.52.11-.11.25-.29.38-.43.12-.15.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.48-.4-.41-.56-.42h-.48c-.16 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.56c.12.16 1.75 2.67 4.24 3.75.59.26 1.06.41 1.42.53.6.19 1.15.16 1.59.1.49-.07 1.49-.61 1.7-1.2.21-.59.21-1.09.15-1.2-.06-.11-.23-.18-.48-.31Z" />
    </svg>
  )
}

export function CTASection({ portalHref: _portalHref }: CTASectionProps) {
  return (
    <section className="relative z-10 overflow-hidden bg-white py-16 sm:py-20">
      <div className="container min-w-0">
        <div className="relative min-w-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#f9fbfe_0%,#ffffff_52%,#fff6f6_100%)] shadow-[0_26px_70px_rgba(14,43,82,0.08)]">
          <div className="grid min-w-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-stretch">
            <div className="relative z-10 min-w-0 px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
              <div className="mb-5 flex min-w-0 flex-wrap items-center gap-3 text-prime-red">
                <Brain className="h-5 w-5 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.24em]">O método PRIME</span>
                <GraduationCap className="h-5 w-5 shrink-0" />
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-[#0b2c5c] md:text-4xl">Aprendizagem que permanece.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Uma escola de inglês que acompanha sua evolução, aula após aula. O professor permanece no centro e cada encontro continua a história do anterior.
              </p>

              <div className="mt-7 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={trialLessonHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Agende sua aula experimental grátis"
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'h-auto min-h-12 w-full min-w-0 max-w-full whitespace-normal rounded-full border border-[#1565D8] bg-[#1565D8] px-6 py-3 text-center text-base font-semibold leading-5 text-white shadow-[0_18px_42px_rgba(21,101,216,0.22)] hover:bg-[#0f56bd] hover:text-white sm:w-auto sm:px-7'
                  )}
                >
                  <CalendarCheck className="mr-2 h-5 w-5 shrink-0" />
                  Agende sua aula experimental grátis
                  <ArrowRight className="ml-2 h-5 w-5 shrink-0" />
                </a>

                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Falar com a Prime Digital Hub pelo WhatsApp"
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'h-auto min-h-12 w-full min-w-0 max-w-full whitespace-normal rounded-full border border-[#118640] bg-[#118640] px-6 py-3 text-center text-base font-semibold leading-5 text-white shadow-[0_18px_42px_rgba(17,134,64,0.24)] transition hover:border-[#0f753a] hover:bg-[#0f753a] hover:text-white sm:w-auto sm:px-7'
                  )}
                >
                  <WhatsAppIcon className="mr-2 h-5 w-5 shrink-0" />
                  Falar com a Prime no WhatsApp
                </a>
              </div>
            </div>

            <div className="relative flex min-w-0 flex-col overflow-hidden lg:block lg:min-h-full">
              <img
                src={communityImage}
                alt="Comunidade de alunos aprendendo juntos no Prime Digital Hub"
                width={900}
                height={440}
                className="order-2 h-auto w-full contrast-[1.03] brightness-[1.03] saturate-[1.04] lg:absolute lg:inset-0 lg:h-full lg:object-cover"
              />
              <div className="absolute inset-0 hidden bg-gradient-to-r from-white/25 via-transparent to-[#0b2c5c]/10 lg:block" />
              <div className="relative order-1 bg-white/90 px-5 py-4 lg:absolute lg:right-5 lg:top-5 lg:max-w-[calc(100%-2rem)] lg:rounded-2xl lg:shadow-lg lg:backdrop-blur">
                <p className="font-display text-base font-bold uppercase tracking-[0.12em] text-[#0b2c5c] sm:text-lg sm:tracking-[0.14em]">More than English.</p>
                <div className="mt-2 h-1 w-20 rounded-full bg-prime-red" />
              </div>
              <div className="relative order-3 bg-[#0b2c5c] px-5 py-4 text-white lg:absolute lg:bottom-5 lg:left-5 lg:max-w-[calc(100%-2.5rem)] lg:rounded-2xl lg:bg-[#0b2c5c]/90 lg:shadow-lg lg:backdrop-blur">
                <p className="font-display text-xl font-bold italic sm:text-2xl">Faça cada aula contar.</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-white/80 sm:tracking-[0.18em]">Learn · Improve · Belong</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

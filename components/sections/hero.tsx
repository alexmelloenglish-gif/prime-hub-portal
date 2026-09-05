import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  History,
  ShieldCheck,
  Target,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const heroStudentImage = '/assets/prime-hero-student.webp'

interface HeroSectionProps {
  portalHref: string
}

const bookingHref = 'https://calendar.app.google/z1N7yrhvrVr6WyfFA'
const whatsappHref =
  'https://api.whatsapp.com/send/?phone=5521965147515&text=Oi%21+Gostaria+de%20falar%20com%20a%20Prime%20Digital%20Hub.&type=phone_number&app_absent=0'

const flow = [
  { icon: CalendarCheck, label: 'Próxima aula', text: 'Mais contexto' },
  { icon: BookOpen, label: 'Aula', text: 'Interações reais e decisões pedagógicas' },
  { icon: History, label: 'Memória da aprendizagem', text: 'O que importa permanece para a próxima aula' },
  { icon: Target, label: 'Direção do professor', text: 'O próximo foco ganha clareza' },
]

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.07 2C6.59 2 2.12 6.46 2.12 11.96c0 1.76.46 3.48 1.34 5L2 22l5.2-1.36a9.9 9.9 0 0 0 4.75 1.21h.01c5.47 0 9.93-4.46 9.93-9.95 0-2.65-1.03-5.14-2.84-6.99Zm-6.98 15.25h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.09.81.83-3.01-.2-.31a8.23 8.23 0 0 1-1.27-4.36c0-4.56 3.7-8.27 8.25-8.27 2.2 0 4.26.86 5.81 2.43a8.16 8.16 0 0 1 2.4 5.84c0 4.55-3.7 8.25-8.24 8.25Zm4.53-6.17c-.25-.13-1.49-.74-1.72-.82-.23-.08-.39-.13-.56.13-.16.25-.64.82-.79.99-.15.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.26a7.42 7.42 0 0 1-1.38-1.72c-.14-.25-.02-.39.11-.52.11-.11.25-.29.38-.43.12-.15.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.48-.4-.41-.56-.42h-.48c-.16 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.56c.12.16 1.75 2.67 4.24 3.75.59.26 1.06.41 1.42.53.6.19 1.15.16 1.59.1.49-.07 1.49-.61 1.7-1.2.21-.59.21-1.09.15-1.2-.06-.11-.23-.18-.48-.31Z" />
    </svg>
  )
}

export function HeroSection({ portalHref }: HeroSectionProps) {
  return (
    <section id="inicio" className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute right-[-10rem] top-[-8rem] h-[34rem] w-[34rem] rounded-full bg-[#eaf2fb] blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute left-[-12rem] top-[28rem] h-[28rem] w-[28rem] rounded-full bg-red-50 blur-3xl" aria-hidden="true" />

      <div className="container relative z-10 grid items-center gap-10 pb-10 pt-10 lg:grid-cols-[0.93fr_1.07fr] lg:pb-12 lg:pt-14">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#244571] sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-prime-red" />
            Prime Digital Hub · Seu ecossistema de aprendizagem
          </div>

          <div className="space-y-5">
            <h1 className="max-w-3xl font-display text-[2.65rem] font-extrabold leading-[0.98] tracking-[-0.035em] text-[#0b2c5c] sm:text-5xl lg:text-[4.3rem]">
              Sua escola de inglês continua evoluindo.
              <span className="mt-2 block text-[#0b2c5c]">Aprendizagem que permanece.</span>
            </h1>
            <div className="h-1.5 w-28 rounded-full bg-prime-red" />
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
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'rounded-full border border-[#25D366] bg-[#25D366] px-7 py-6 text-base font-semibold text-white shadow-[0_18px_42px_rgba(37,211,102,0.20)] hover:bg-[#1ebe5d]'
              )}
            >
              <WhatsAppIcon className="mr-2 h-5 w-5" />
              Falar com a Prime
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
          <div className="absolute -inset-5 rounded-[2.5rem] bg-[radial-gradient(circle_at_top_right,rgba(168,34,23,0.10),transparent_38%),linear-gradient(135deg,#eef5fb,#ffffff_55%,#f8fbff)] shadow-[0_40px_100px_rgba(14,43,82,0.10)]" />
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(14,43,82,0.12)]">
            <img src={heroStudentImage} alt="Aluna estudando inglês online no Prime Digital Hub" className="h-[360px] w-full object-cover sm:h-[430px]" />
            <div className="absolute right-5 top-5 rounded-2xl bg-white/92 px-4 py-3 shadow-lg backdrop-blur">
              <p className="font-display text-xl font-bold leading-tight text-[#0b2c5c]">Learn · Improve · Belong</p>
              <div className="mt-2 h-1 w-20 rounded-full bg-prime-red" />
            </div>
            <div className="absolute bottom-5 right-5 rounded-2xl bg-[#0b2c5c]/92 px-4 py-3 text-white shadow-lg backdrop-blur">
              <p className="font-display text-lg font-bold">Better English.</p>
              <p className="text-sm font-semibold text-white/80">Brighter Futures.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container relative z-10 pb-16">
        <div className="grid overflow-hidden rounded-[1.7rem] border border-slate-200 bg-[#f7fafd] shadow-[0_18px_50px_rgba(14,43,82,0.07)] md:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div className="p-6 sm:p-7">
            <h2 className="font-display text-2xl font-bold text-[#0b2c5c]">Sua aprendizagem, com o seu contexto.</h2>
            <p className="mt-2 font-semibold text-[#123263]">A próxima aula não começa do zero.</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">Ela começa com a memória do que foi trabalhado, observado e direcionado pelo professor.</p>
            <p className="mt-5 border-l-4 border-prime-red pl-4 font-display text-lg font-bold italic text-[#0b2c5c]">Faça cada aula contar.</p>
          </div>
          {flow.map(({ icon: Icon, label, text }, index) => (
            <div key={label} className="relative border-t border-slate-200 bg-white p-5 md:border-l md:border-t-0">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4fa]">
                <Icon className="h-6 w-6 text-[#123263]" />
              </div>
              <p className="font-display text-base font-bold text-[#0b2c5c]">{label}</p>
              <p className="mt-2 text-sm leading-5 text-slate-600">{text}</p>
              {index < flow.length - 1 ? <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-[#123263] md:block" /> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

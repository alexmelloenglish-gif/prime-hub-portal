import Link from 'next/link'
import { CalendarDays, Menu, UserRound } from 'lucide-react'
import { BrandLogo } from '@/components/layout/brand-logo'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  portalHref: string
}

const bookingHref = 'https://calendar.app.google/z1N7yrhvrVr6WyfFA'

const navigationLinks = [
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#exemplo', label: 'Exemplo' },
  { href: '#professor', label: 'Professor' },
  { href: '#duvidas', label: 'Dúvidas' },
]

export function Header({ portalHref }: HeaderProps) {
  return (
    <header className="relative z-40 border-b border-slate-200/80 bg-white/95 shadow-[0_8px_32px_rgba(15,39,75,0.04)] backdrop-blur">
      <nav aria-label="Navegação principal" className="container flex min-w-0 items-center justify-between gap-3 py-2.5 sm:py-3">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Prime Digital Hub - início">
          <BrandLogo
            variant="full"
            className="h-[62px] w-[144px] border-0 bg-transparent p-0 shadow-none sm:h-[70px] sm:w-[160px] lg:h-[76px] lg:w-[176px]"
            priority
          />
        </Link>

        <div className="hidden items-center gap-1 text-sm font-semibold text-[#123263] xl:flex">
          {navigationLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="inline-flex min-h-11 items-center rounded-lg px-3 py-2 whitespace-nowrap transition hover:bg-slate-50 hover:text-prime-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-prime-red"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href={portalHref}
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#123263]/20 bg-white px-3.5 text-sm font-semibold text-[#123263] transition hover:border-[#123263]/35 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123263] focus-visible:ring-offset-2 sm:px-4"
            aria-label="Acessar Portal do aluno"
          >
            <UserRound className="mr-1.5 h-4 w-4" />
            <span className="hidden sm:inline">Portal do aluno</span>
            <span className="sm:hidden">Portal</span>
          </Link>

          <a
            href={bookingHref}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants(),
              'hidden h-auto min-h-10 rounded-full bg-[#1565D8] px-5 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(21,101,216,0.22)] hover:bg-[#0f56bd] hover:text-white md:inline-flex'
            )}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Agendar aula experimental
          </a>

          <details className="group relative xl:hidden">
            <summary
              className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-slate-200 bg-white text-[#123263] transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-prime-red [&::-webkit-details-marker]:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </summary>

            <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(86vw,22rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_70px_rgba(14,43,82,0.18)]">
              <div className="grid gap-1 text-sm font-semibold text-[#123263]">
                {navigationLinks.map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    className="flex min-h-11 items-center rounded-xl px-3 py-2 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-prime-red"
                  >
                    {label}
                  </a>
                ))}
                <a
                  href={bookingHref}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 flex min-h-11 items-center justify-center rounded-xl bg-[#1565D8] px-4 py-2.5 text-center font-semibold text-white shadow-sm hover:bg-[#0f56bd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1565D8] focus-visible:ring-offset-2 md:hidden"
                >
                  <CalendarDays className="mr-2 h-4 w-4 shrink-0" />
                  Agendar aula experimental
                </a>
              </div>
            </div>
          </details>
        </div>
      </nav>
    </header>
  )
}

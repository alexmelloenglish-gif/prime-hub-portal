import Link from 'next/link'
import { CalendarDays, ChevronDown, Menu } from 'lucide-react'
import { BrandLogo } from '@/components/layout/brand-logo'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  portalHref: string
}

const bookingHref = 'https://calendar.app.google/z1N7yrhvrVr6WyfFA'

const navigationLinks = [
  { href: '#inicio', label: 'Início' },
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#metodo-prime', label: 'Método PRIME' },
  { href: '#diferenciais', label: 'Diferenciais' },
  { href: '#comparativo', label: 'Antes e depois' },
]

export function Header({ portalHref }: HeaderProps) {
  return (
    <header className="relative z-30 border-b border-slate-200/80 bg-white/95 shadow-[0_8px_32px_rgba(15,39,75,0.04)] backdrop-blur">
      <nav aria-label="Navegação principal" className="container flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Prime Digital Hub - início">
          <BrandLogo
            variant="full"
            className="h-[72px] w-[164px] border-0 bg-transparent p-0 shadow-none sm:h-[82px] sm:w-[188px] lg:h-[92px] lg:w-[210px]"
            priority
          />
        </Link>

        <div className="hidden items-center gap-5 text-sm font-semibold text-[#123263] xl:flex">
          {navigationLinks.map(({ href, label }) => (
            <a key={href} href={href} className="whitespace-nowrap transition hover:text-prime-red">{label}</a>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href={portalHref}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'rounded-full border-[#123263]/25 bg-white px-4 text-sm font-semibold text-[#123263] hover:bg-slate-50 hover:text-[#123263] sm:px-5'
            )}
          >
            <span className="sm:hidden">Portal</span>
            <span className="hidden sm:inline">Acessar portal</span>
          </Link>
          <a
            href={bookingHref}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants(),
              'hidden h-auto min-h-10 rounded-full bg-prime-red px-5 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(168,34,23,0.22)] hover:bg-red-700 md:inline-flex'
            )}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Aula experimental grátis
          </a>
        </div>

        <details className="group w-full min-w-0 border-t border-slate-200 pt-1 xl:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#123263] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-prime-red [&::-webkit-details-marker]:hidden">
            <Menu aria-hidden="true" className="h-5 w-5" />
            Menu
            <ChevronDown aria-hidden="true" className="ml-auto h-4 w-4 transition group-open:rotate-180" />
          </summary>
          <div className="grid gap-1 pb-2 text-sm font-semibold text-[#123263] sm:grid-cols-2">
            {navigationLinks.map(({ href, label }) => (
              <a key={href} href={href} className="flex min-h-11 items-center rounded-lg px-3 py-2 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-prime-red">{label}</a>
            ))}
            <a href={bookingHref} target="_blank" rel="noreferrer" className="flex min-h-11 items-center rounded-lg px-3 py-2 text-prime-red hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-prime-red md:hidden">
              <CalendarDays aria-hidden="true" className="mr-2 h-4 w-4 shrink-0" />
              Aula experimental grátis
            </a>
          </div>
        </details>
      </nav>
    </header>
  )
}

import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import { BrandLogo } from '@/components/layout/brand-logo'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  portalHref: string
}

const bookingHref = 'https://calendar.app.google/z1N7yrhvrVr6WyfFA'

export function Header({ portalHref }: HeaderProps) {
  return (
    <header className="relative z-30 border-b border-slate-200/80 bg-white/95 shadow-[0_8px_32px_rgba(15,39,75,0.04)] backdrop-blur">
      <nav className="container flex min-w-0 items-center justify-between gap-4 py-3">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Prime Digital Hub - início">
          <BrandLogo
            variant="full"
            className="h-[72px] w-[164px] border-0 bg-transparent p-0 shadow-none sm:h-[82px] sm:w-[188px] lg:h-[92px] lg:w-[210px]"
            priority
          />
        </Link>

        <div className="hidden items-center gap-6 text-sm font-semibold text-[#123263] lg:flex">
          <a href="#inicio" className="transition hover:text-prime-red">Início</a>
          <a href="#como-funciona" className="transition hover:text-prime-red">Como funciona</a>
          <a href="#metodo-prime" className="transition hover:text-prime-red">Método PRIME</a>
          <a href="#diferenciais" className="transition hover:text-prime-red">Diferenciais</a>
          <a href="#comparativo" className="transition hover:text-prime-red">Antes e depois</a>
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
              'hidden rounded-full bg-prime-red px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(168,34,23,0.22)] hover:bg-red-700 sm:inline-flex'
            )}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Aula experimental grátis
          </a>
        </div>
      </nav>
    </header>
  )
}

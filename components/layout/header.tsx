import Link from 'next/link'
import { BrandLogo } from '@/components/layout/brand-logo'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  portalHref: string
}

export function Header({ portalHref }: HeaderProps) {
  return (
    <header className="relative z-10 container py-6">
      <nav className="flex min-w-0 items-center justify-between gap-3">
        <Link href="/" className="flex min-w-0 items-center">
          <BrandLogo variant="full" className="h-16 w-44 sm:h-[72px] sm:w-52" priority />
        </Link>
        <Link
          href={portalHref}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'shrink-0 rounded-full border-white/20 px-3 text-sm text-white hover:bg-white/10 hover:text-white sm:px-6'
          )}
        >
          <span className="sm:hidden">Portal</span>
          <span className="hidden sm:inline">Acessar portal</span>
        </Link>
      </nav>
    </header>
  )
}

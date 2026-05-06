import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  portalHref: string
}

export function Header({ portalHref }: HeaderProps) {
  return (
    <header className="relative z-10 container py-6">
      <nav className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img src="/assets/logo-full.png" alt="Prime Digital Hub" className="h-10 w-auto" />
        </Link>
        <Link
          href={portalHref}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'rounded-full border-white/20 px-6 text-white hover:bg-white/10 hover:text-white'
          )}
        >
          Acessar portal
        </Link>
      </nav>
    </header>
  )
}

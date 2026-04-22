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
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-prime-red text-lg font-bold text-white">
            P
          </div>
          <span className="font-display text-xl font-bold text-white">Prime Digital Hub</span>
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

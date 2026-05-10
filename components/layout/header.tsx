import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  portalHref: string
}

export function Header({ portalHref }: HeaderProps) {
  return (
    <header className="relative z-10 container py-8">
      <nav className="flex items-center justify-between">
        <Link href="/">
          <img
            src="/assets/logo-full.png"
            alt="Prime Digital Hub"
            className="h-16 w-auto object-contain"
            style={{
              clipPath: 'inset(18% 0 28% 0)',
            }}
          />
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

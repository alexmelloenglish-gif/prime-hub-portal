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
        <Link href="/" className="flex items-center">
          <svg
            viewBox="0 0 360 70"
            className="h-14 w-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Círculo vermelho com P branco */}
            <circle cx="35" cy="35" r="30" fill="#DC2626" />
            <text
              x="35"
              y="42"
              textAnchor="middle"
              fontFamily="Arial, sans-serif"
              fontSize="34"
              fontWeight="bold"
              fill="#FFFFFF"
            >
              P
            </text>
            {/* RIME em branco */}
            <text
              x="80"
              y="40"
              fontFamily="Arial, sans-serif"
              fontSize="32"
              fontWeight="bold"
              fill="#FFFFFF"
              letterSpacing="1"
            >
              RIME
            </text>
            {/* DIGITAL HUB em branco, menor, embaixo */}
            <text
              x="80"
              y="54"
              fontFamily="Arial, sans-serif"
              fontSize="13"
              fontWeight="600"
              fill="#FFFFFF"
              letterSpacing="3"
            >
              DIGITAL HUB
            </text>
            {/* Linha vermelha embaixo do texto */}
            <rect x="80" y="60" width="120" height="3" fill="#DC2626" />
          </svg>
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

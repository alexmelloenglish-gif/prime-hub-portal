'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  onEnterPortal: () => void
}

export function Header({ onEnterPortal }: HeaderProps) {
  return (
    <header className="relative z-10 container py-6">
      <nav className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-prime-red flex items-center justify-center text-white font-display font-bold text-lg">
            P
          </div>
          <span className="font-display font-bold text-xl text-white">
            Prime Digital Hub
          </span>
        </Link>
        <Button 
          onClick={onEnterPortal}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10 rounded-full px-6"
        >
          Acessar Portal
        </Button>
      </nav>
    </header>
  )
}

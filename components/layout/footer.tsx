'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 py-8 mt-20">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-prime-red flex items-center justify-center text-white font-display font-bold">
              P
            </div>
            <span className="text-prime-cream/60 text-sm">
              © 2024 Prime Digital Hub. Todos os direitos reservados.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-prime-cream/40 text-sm">Seu Ecossistema de Aprendizado</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

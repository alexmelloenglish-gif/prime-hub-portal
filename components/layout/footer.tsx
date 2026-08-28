import { BrandLogo } from './brand-logo'

export function Footer() {
  return (
    <footer className="relative z-10 mt-20 border-t border-white/10 py-8">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-1.5">
              <BrandLogo variant="mark" className="h-9 w-9" />
            </div>
            <span className="text-sm text-prime-cream/60">© 2026 Prime Digital Hub. Todos os direitos reservados.</span>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm font-medium text-prime-cream/70">Aprendizagem que permanece.</p>
            <p className="mt-1 text-sm text-prime-cream/40">Seu ecossistema de aprendizagem</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

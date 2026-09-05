import { BrandLogo } from './brand-logo'

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-200 bg-white py-8">
      <div className="container">
        <div className="grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div className="flex items-center">
            <BrandLogo variant="full" className="h-[78px] w-[174px] border-0 bg-transparent p-0 shadow-none" />
          </div>

          <div className="text-sm text-slate-500 md:text-center">
            <p className="font-semibold text-[#123263]">Seu ecossistema de aprendizagem.</p>
            <p className="mt-1">© 2026 Prime Digital Hub. Todos os direitos reservados.</p>
          </div>

          <div className="md:text-right">
            <p className="font-display text-base font-bold text-[#0b2c5c]">Faça cada aula contar.</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-prime-red">Learn · Improve · Belong</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

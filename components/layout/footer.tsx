export function Footer() {
  return (
    <footer className="relative z-10 mt-20 border-t border-white/10 py-8">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3">
            <img src="/assets/logo-mini.png" alt="Prime Digital Hub" className="h-12 w-12 object-contain" />
            <span className="text-sm text-prime-cream/60">© 2026 Prime Digital Hub. Todos os direitos reservados.</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm text-prime-cream/40">Seu ecossistema de aprendizado</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

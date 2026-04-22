'use client'

import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="relative z-10 container py-20">
      <div className="glass-card p-12 md:p-16 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
          Pronto para transformar seu inglês?
        </h2>
        <p className="text-lg text-prime-cream/80 mb-8 max-w-2xl mx-auto">
          Entre no portal e descubra uma nova forma de aprender idiomas com a metodologia mais avançada do mercado.
        </p>
        <Button className="bg-prime-red hover:bg-red-700 text-white rounded-full px-8 py-6 text-base font-semibold">
          Começar Agora
        </Button>
      </div>
    </section>
  )
}

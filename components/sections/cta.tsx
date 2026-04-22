import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CTASectionProps {
  portalHref: string
}

export function CTASection({ portalHref }: CTASectionProps) {
  return (
    <section className="relative z-10 container py-20">
      <div className="glass-card p-12 text-center md:p-16">
        <h2 className="mb-6 font-display text-3xl font-bold text-white md:text-4xl">Pronto para transformar seu inglês?</h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-prime-cream/80">
          Entre no portal e descubra uma nova forma de aprender idiomas com uma estrutura pronta para escalar.
        </p>
        <Link
          href={portalHref}
          className={cn(
            buttonVariants({ size: 'lg' }),
            'rounded-full bg-prime-red px-8 py-6 text-base font-semibold text-white hover:bg-red-700'
          )}
        >
          Começar agora
        </Link>
      </div>
    </section>
  )
}

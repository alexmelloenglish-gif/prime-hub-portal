import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CTASectionProps {
  portalHref: string
}

const whatsappHref =
  'https://wa.me/5521965147515?text=Oi!%20Gostaria%20de%20falar%20com%20a%20Prime%20Digital%20Hub.'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.07 2C6.59 2 2.12 6.46 2.12 11.96c0 1.76.46 3.48 1.34 5L2 22l5.2-1.36a9.9 9.9 0 0 0 4.75 1.21h.01c5.47 0 9.93-4.46 9.93-9.95 0-2.65-1.03-5.14-2.84-6.99Zm-6.98 15.25h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.09.81.83-3.01-.2-.31a8.23 8.23 0 0 1-1.27-4.36c0-4.56 3.7-8.27 8.25-8.27 2.2 0 4.26.86 5.81 2.43a8.16 8.16 0 0 1 2.4 5.84c0 4.55-3.7 8.25-8.24 8.25Zm4.53-6.17c-.25-.13-1.49-.74-1.72-.82-.23-.08-.39-.13-.56.13-.16.25-.64.82-.79.99-.15.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.26a7.42 7.42 0 0 1-1.38-1.72c-.14-.25-.02-.39.11-.52.11-.11.25-.29.38-.43.12-.15.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.48-.4-.41-.56-.42h-.48c-.16 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.56c.12.16 1.75 2.67 4.24 3.75.59.26 1.06.41 1.42.53.6.19 1.15.16 1.59.1.49-.07 1.49-.61 1.7-1.2.21-.59.21-1.09.15-1.2-.06-.11-.23-.18-.48-.31Z" />
    </svg>
  )
}

export function CTASection({ portalHref }: CTASectionProps) {
  return (
    <section className="relative z-10 container py-20">
      <div className="glass-card overflow-hidden p-12 text-center md:p-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 font-display text-3xl font-bold text-white md:text-4xl">
            Pronto para transformar seu ingles?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-prime-cream/80">
            Entre no portal, agende seu teste de nivel e fale com a Prime Digital Hub por
            WhatsApp sem sair da pagina principal.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 lg:flex-row">
          <Link
            href={portalHref}
            className={cn(
              buttonVariants({ size: 'lg' }),
              'rounded-full bg-prime-red px-8 py-6 text-base font-semibold text-white hover:bg-red-700'
            )}
          >
            Comecar agora
          </Link>

          <Link
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ size: 'lg', variant: 'outline' }),
              'rounded-full border-emerald-400/60 bg-emerald-500/15 px-8 py-6 text-base font-semibold text-emerald-100 shadow-[0_18px_42px_rgba(16,185,129,0.18)] transition hover:border-emerald-300 hover:bg-emerald-500/25 hover:text-white'
            )}
          >
            <WhatsAppIcon className="mr-3 h-5 w-5" />
            Fale conosco
          </Link>
        </div>
      </div>
    </section>
  )
}

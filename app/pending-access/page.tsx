import Link from 'next/link'
import { BrandLogo } from '@/components/layout/brand-logo'

const primeSupportUrl =
  'https://wa.me/5521965147515?text=Oi!%20Gostaria%20de%20falar%20com%20o%20atendimento%2C%20pode%20me%20ajudar%3F'

export default function PendingAccessPage() {
  return (
    <main className="min-h-screen bg-[#f7faff] px-5 py-8 text-[#0b2c5c] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#45617f] transition-colors hover:text-[#0b2c5c]">
          <span aria-hidden="true">&larr;</span>
          <span>Return to Home</span>
        </Link>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-[#dfe8f3] bg-white shadow-[0_24px_70px_rgba(15,48,93,0.10)]">
          <div className="border-b border-[#e7eef6] px-7 py-7 sm:px-10">
            <BrandLogo variant="full" className="h-16 w-56" priority />
          </div>

          <div className="px-7 py-9 sm:px-10 sm:py-11">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d50000]">Prime Digital Hub</p>
            <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight text-[#0b2c5c] sm:text-5xl">
              Your dashboard is almost ready.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#5b708b]">
              Your Google login is working. Your personal dashboard will open as soon as your Prime access profile is released.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[#dfe8f3] bg-[#f8fbff] p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#eaf2ff] font-bold text-[#1261c9]">1</div>
                <h2 className="text-lg font-bold text-[#0b2c5c]">What happens next</h2>
                <p className="mt-2 text-sm leading-6 text-[#5b708b]">
                  Prime will connect the learning information, links, attendance and feedback available for your personal dashboard.
                </p>
              </div>
              <div className="rounded-2xl border border-[#dfe8f3] bg-[#f8fbff] p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#eaf8f1] font-bold text-[#169b62]">2</div>
                <h2 className="text-lg font-bold text-[#0b2c5c]">Need access now?</h2>
                <p className="mt-2 text-sm leading-6 text-[#5b708b]">
                  Contact Prime Support on WhatsApp and we will check the access linked to your Google account.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={primeSupportUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#169b62] px-6 py-3 font-bold text-white transition hover:bg-[#128454]"
              >
                Contact Prime Support
              </a>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-[#cbd8e7] bg-white px-6 py-3 font-bold text-[#0b2c5c] transition hover:bg-[#f4f8fc]"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

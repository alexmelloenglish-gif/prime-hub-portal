import Link from 'next/link'

export default function PendingAccessPage() {
  return (
    <main className="min-h-screen bg-prime-gradient px-4 py-12">
      <div className="container">
        <div className="mx-auto max-w-2xl glass-card p-8 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-prime-cream/50">
            Prime Digital Hub
          </p>
          <h1 className="mt-4 text-4xl font-bold text-white">Your dashboard is almost ready.</h1>
          <p className="mt-4 text-base leading-7 text-prime-cream/80">
            Your Google login is working, but your student profile has not been released in the Firestore
            dashboard yet. As soon as your email is registered, this area will unlock automatically.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">What happens next</h2>
              <p className="mt-2 text-sm text-prime-cream/70">
                Prime will connect your lesson data, links, attendance and feedback to your personal dashboard.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">Need access now?</h2>
              <p className="mt-2 text-sm text-prime-cream/70">
                Contact the support team so they can register your email inside the student collection.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="mailto:support@primedigitalhub.com" className="btn-primary">
              Contact Prime Support
            </Link>
            <Link href="/" className="btn-secondary">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

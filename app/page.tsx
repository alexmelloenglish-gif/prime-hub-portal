import { getServerSession } from 'next-auth'
import { Header } from '@/components/layout/header'
import { HeroSection } from '@/components/sections/hero'
import { FeaturesGrid } from '@/components/sections/features-grid'
import { WhyPrimeSection } from '@/components/sections/why-prime'
import { ComparisonSection } from '@/components/sections/comparison'
import { CTASection } from '@/components/sections/cta'
import { Footer } from '@/components/layout/footer'
import { authOptions } from '@/lib/auth'

export default async function Home() {
  const session = await getServerSession(authOptions)
  const portalHref = session ? '/dashboard' : '/login'

  return (
    <main className="min-h-screen bg-prime-gradient">
      <Header portalHref={portalHref} />
      <HeroSection portalHref={portalHref} />
      <FeaturesGrid />
      <WhyPrimeSection />
      <ComparisonSection />
      <CTASection portalHref={portalHref} />
      <Footer />
    </main>
  )
}

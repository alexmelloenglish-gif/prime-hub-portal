import { getServerSession } from 'next-auth'
import { Header } from '@/components/layout/header'
import { HeroSection } from '@/components/sections/hero'
import { FeaturesGrid } from '@/components/sections/features-grid'
import { FAQSection } from '@/components/sections/faq'
import { LearningLoopDemo } from '@/components/sections/learning-loop-demo'
import { WhyPrimeSection } from '@/components/sections/why-prime'
import { ComparisonApprovedSection } from '@/components/sections/comparison-approved'
import { CTASection } from '@/components/sections/cta'
import { Footer } from '@/components/layout/footer'
import { authOptions } from '@/lib/auth'

export default async function Home() {
  const session = await getServerSession(authOptions)
  const portalHref = session ? '/dashboard' : '/login'

  return (
    <main className="min-h-screen bg-white text-[#0b2c5c]">
      <Header portalHref={portalHref} />
      <HeroSection />
      <LearningLoopDemo />
      <FeaturesGrid />
      <WhyPrimeSection />
      <ComparisonApprovedSection />
      <FAQSection />
      <CTASection portalHref={portalHref} />
      <Footer />
    </main>
  )
}

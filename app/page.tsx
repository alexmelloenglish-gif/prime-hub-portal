import { Header } from '@/components/layout/header'
import { HeroSection } from '@/components/sections/hero'
import { LearningLoopDemo } from '@/components/sections/learning-loop-demo'
import { FeaturesGrid } from '@/components/sections/features-grid'
import { FAQSection } from '@/components/sections/faq'
import { CTASection } from '@/components/sections/cta'
import { Footer } from '@/components/layout/footer'

export default async function Home() {
  // Keep the public landing independent from NextAuth configuration.
  // The dashboard owns authentication and redirects unauthenticated visitors.
  const portalHref = '/dashboard'

  return (
    <main className="min-h-screen bg-white text-[#0b2c5c]">
      <Header portalHref={portalHref} />
      <HeroSection />
      <LearningLoopDemo />
      <FeaturesGrid />
      <FAQSection />
      <CTASection portalHref={portalHref} />
      <Footer portalHref={portalHref} />
    </main>
  )
}

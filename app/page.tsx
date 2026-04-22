'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { HeroSection } from '@/components/sections/hero'
import { FeaturesGrid } from '@/components/sections/features-grid'
import { WhyPrimeSection } from '@/components/sections/why-prime'
import { ComparisonSection } from '@/components/sections/comparison'
import { CTASection } from '@/components/sections/cta'
import { Footer } from '@/components/layout/footer'

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleEnterPortal = () => {
    if (session) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }

  return (
    <main className="min-h-screen bg-prime-gradient">
      <Header onEnterPortal={handleEnterPortal} />
      <HeroSection onEnterPortal={handleEnterPortal} />
      <FeaturesGrid />
      <WhyPrimeSection />
      <ComparisonSection />
      <CTASection />
      <Footer />
    </main>
  )
}

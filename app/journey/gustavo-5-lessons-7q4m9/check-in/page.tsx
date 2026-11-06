import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { GustavoJourneyCheckIn } from '@/components/journey/gustavo-journey-check-in'
import { authOptions } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Gustavo • My English Journey Check-In | Prime Digital Hub',
  description: 'Learner self-awareness check-in.',
  robots: { index: false, follow: false, nocache: true },
}

export default async function GustavoJourneyCheckInPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect('/login?callbackUrl=%2Fjourney%2Fgustavo-5-lessons-7q4m9%2Fcheck-in')
  }

  return <GustavoJourneyCheckIn />
}

import type { Metadata } from 'next'
import { GustavoJourneyCheckIn } from '@/components/journey/gustavo-journey-check-in'

export const metadata: Metadata = {
  title: 'Gustavo • My English Journey Check-In | Prime Digital Hub',
  description: 'Learner self-awareness check-in.',
  robots: { index: false, follow: false, nocache: true },
}

export default function GustavoJourneyCheckInPage() {
  return <GustavoJourneyCheckIn />
}

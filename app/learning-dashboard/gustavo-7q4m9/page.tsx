import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Gustavo • Learning Dashboard | Prime Digital Hub',
  robots: { index: false, follow: false, nocache: true },
}

export default function GustavoLearningDashboardShortcut() {
  redirect('/journey/gustavo-5-lessons-7q4m9')
}

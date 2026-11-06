import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Gustavo • Learning Portfolio | Prime Digital Hub',
  robots: { index: false, follow: false, nocache: true },
}

export default async function GustavoPortfolioShortcut() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect('/login?callbackUrl=%2Fportfolio%2Fgustavo-7q4m9')
  }

  redirect('https://docs.google.com/document/d/1H5a9nmIDW19gVKhmJUQpRZORYsGSPsoqvYf6d6uC9iU/edit')
}

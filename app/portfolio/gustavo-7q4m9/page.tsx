import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Gustavo • Learning Portfolio | Prime Digital Hub',
  robots: { index: false, follow: false, nocache: true },
}

export default function GustavoPortfolioShortcut() {
  redirect('https://docs.google.com/document/d/1H5a9nmIDW19gVKhmJUQpRZORYsGSPsoqvYf6d6uC9iU/edit')
}

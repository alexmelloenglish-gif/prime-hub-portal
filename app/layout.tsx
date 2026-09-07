import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const montserrat = Montserrat({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: 'Prime Digital Hub | Inglês personalizado com aprendizagem contínua',
  description:
    'Aulas de inglês personalizadas, com professor com autoridade, você no centro, memória permanente e direção clara para sua evolução.',
  metadataBase: new URL('https://www.primedigitalhub.com.br'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Prime Digital Hub | Inglês personalizado com aprendizagem contínua',
    description:
      'Aulas de inglês personalizadas, com professor com autoridade, você no centro, memória permanente e direção clara para sua evolução.',
    url: 'https://www.primedigitalhub.com.br/',
    siteName: 'Prime Digital Hub',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/assets/prime-hero-student-hq.webp',
        width: 958,
        height: 860,
        alt: 'Aluna estudando inglês online no Prime Digital Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prime Digital Hub | Inglês personalizado com aprendizagem contínua',
    description:
      'Aulas de inglês personalizadas, com professor com autoridade, você no centro, memória permanente e direção clara para sua evolução.',
    images: ['/assets/prime-hero-student-hq.webp'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="font-body bg-prime-dark text-white">{children}</body>
    </html>
  )
}

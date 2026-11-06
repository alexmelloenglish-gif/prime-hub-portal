import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Prime Digital Hub | Inglês personalizado com aprendizagem contínua',
  description:
    'Aulas de inglês online ao vivo para objetivos reais, com professor como autoridade, aluno no centro, memória da aprendizagem e direção clara para sua evolução.',
  metadataBase: new URL('https://www.primedigitalhub.com.br'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Prime Digital Hub | Inglês personalizado com aprendizagem contínua',
    description:
      'Aulas de inglês online ao vivo para objetivos reais, com professor como autoridade, aluno no centro, memória da aprendizagem e direção clara para sua evolução.',
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
      'Aulas de inglês online ao vivo para objetivos reais, com professor como autoridade, aluno no centro, memória da aprendizagem e direção clara para sua evolução.',
    images: ['/assets/prime-hero-student-hq.webp'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="font-body bg-prime-dark text-white">{children}</body>
    </html>
  )
}

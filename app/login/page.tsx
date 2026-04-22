'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { redirect: true, callbackUrl: '/dashboard' })
    } catch (err) {
      setError('Erro ao fazer login com Google')
      setIsLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
      })

      if (result?.error) {
        setError('Erro ao enviar link de acesso')
      } else {
        setEmail('')
        alert('Link de acesso enviado para seu email!')
      }
    } catch (err) {
      setError('Erro ao enviar link de acesso')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-prime-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-prime-cream/60 hover:text-white mb-8 transition-colors">
          <span>←</span>
          <span>Voltar ao início</span>
        </Link>

        {/* Login Card */}
        <div className="glass-card p-8 space-y-6">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-prime-red flex items-center justify-center text-white text-3xl font-display font-bold shadow-lg shadow-prime-red/30">
              P
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="font-display text-2xl font-bold text-white">
              Bem-vindo de volta!
            </h1>
            <p className="text-prime-cream/70">
              Acesse o Portal do Aluno Prime Digital Hub
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white text-prime-dark hover:bg-gray-100 font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar com Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-b from-prime-dark to-prime-dark text-prime-cream/60">
                OU CONTINUE COM E-MAIL
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-prime-red focus:border-transparent"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-prime-red hover:bg-red-700 text-white font-semibold py-3 rounded-lg"
            >
              {isLoading ? 'Enviando...' : 'Enviar link de acesso'}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-prime-cream/60">
            Ao continuar, você concorda com nossos{' '}
            <a href="#" className="text-prime-red hover:underline">
              Termos de Uso
            </a>
            {' '}e{' '}
            <a href="#" className="text-prime-red hover:underline">
              Política de Privacidade
            </a>
          </div>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-prime-cream/60">
            Ainda não é aluno?{' '}
            <a href="#" className="text-prime-red hover:underline font-semibold">
              Fale conosco
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}

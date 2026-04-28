import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import { authOptions, isGoogleAuthConfigured } from '@/lib/auth'

const authErrorMessages: Record<string, string> = {
  AccessDenied: 'Seu acesso foi recusado. Verifique se a conta Google autorizada esta correta.',
  Callback: 'O retorno do Google falhou. Confira o callback URL e tente novamente.',
  Configuration: 'A autenticacao ainda nao esta configurada corretamente.',
  OAuthAccountNotLinked: 'Esse e-mail ja existe com outro metodo de acesso.',
  OAuthCallback: 'O callback do Google falhou. Revise GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e NEXTAUTH_URL.',
  OAuthSignin: 'Nao foi possivel iniciar o login com Google.',
  SessionRequired: 'Faca login para acessar essa area.',
  default: 'Nao foi possivel concluir o login agora.',
}

const allowedCallbackUrls = new Set([
  '/dashboard',
  '/dashboard/aulas',
  '/dashboard/progresso',
  '/dashboard/goals',
  '/dashboard/metas',
  '/dashboard/conversacao',
  '/dashboard/configuracoes',
  '/dashboard/admin',
])

function normalizeCallbackUrl(callbackUrl?: string) {
  if (!callbackUrl || !callbackUrl.startsWith('/')) {
    return '/dashboard'
  }

  const sanitizedUrl = callbackUrl.split('?')[0]

  if (allowedCallbackUrls.has(sanitizedUrl)) {
    return callbackUrl
  }

  return '/dashboard'
}

type LoginPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string
    error?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerSession(authOptions)
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const callbackUrl = normalizeCallbackUrl(resolvedSearchParams?.callbackUrl)
  const authError =
    typeof resolvedSearchParams?.error === 'string'
      ? authErrorMessages[resolvedSearchParams.error] ?? authErrorMessages.default
      : ''

  if (session?.user) {
    redirect(callbackUrl)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-prime-gradient p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-prime-cream/60 transition-colors hover:text-white">
          <span>&larr;</span>
          <span>Voltar ao inicio</span>
        </Link>

        <div className="glass-card space-y-6 p-8">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-prime-red text-3xl font-bold text-white shadow-lg shadow-prime-red/30">
              P
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h1 className="font-display text-2xl font-bold text-white">Acesse sua conta</h1>
            <p className="text-prime-cream/70">
              Entre no Prime Digital Hub usando apenas sua conta Google autorizada.
            </p>
          </div>

          {!isGoogleAuthConfigured ? (
            <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env.local para habilitar o login.
            </div>
          ) : null}

          {authError ? (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {authError}
            </div>
          ) : null}

          <GoogleSignInButton callbackUrl={callbackUrl} disabled={!isGoogleAuthConfigured} />

          <div className="text-center text-sm text-prime-cream/60">
            Ao continuar, voce concorda com nossos termos de uso e politica de privacidade.
          </div>

          <div className="text-center text-sm text-prime-cream/60">
            Ainda nao e aluno?{' '}
            <a href="mailto:support@primedigitalhub.com" className="font-semibold text-prime-red hover:underline">
              Fale conosco
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}

import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import { BrandLogo } from '@/components/layout/brand-logo'
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
  '/dashboard/action',
])

const primeSupportUrl =
  'https://wa.me/5521965147515?text=Oi!%20Gostaria%20de%20falar%20com%20o%20atendimento%2C%20pode%20me%20ajudar%3F'

function normalizeCallbackUrl(callbackUrl?: string) {
  if (!callbackUrl || !callbackUrl.startsWith('/')) return '/dashboard'
  const sanitizedUrl = callbackUrl.split('?')[0]
  return allowedCallbackUrls.has(sanitizedUrl) ? callbackUrl : '/dashboard'
}

type LoginPageProps = {
  searchParams?: Promise<{ callbackUrl?: string; error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerSession(authOptions)
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const callbackUrl = normalizeCallbackUrl(resolvedSearchParams?.callbackUrl)
  const authError =
    typeof resolvedSearchParams?.error === 'string'
      ? authErrorMessages[resolvedSearchParams.error] ?? authErrorMessages.default
      : ''

  if (session?.user) redirect(callbackUrl)

  return (
    <main className="min-h-screen bg-[#f7faff] text-[#0b2c5c]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8">
        <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#45617f] transition-colors hover:text-[#0b2c5c]">
          <span aria-hidden="true">&larr;</span>
          <span>Voltar ao inicio</span>
        </Link>

        <div className="flex flex-1 items-center justify-center py-10">
          <section className="w-full max-w-md rounded-[2rem] border border-[#dfe8f3] bg-white p-7 shadow-[0_24px_70px_rgba(15,48,93,0.10)] sm:p-9">
            <div className="mb-7 flex justify-center">
              <BrandLogo variant="full" className="h-20 w-64" priority />
            </div>

            <div className="space-y-3 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d50000]">Prime Digital Hub</p>
              <h1 className="font-display text-3xl font-bold tracking-tight text-[#0b2c5c]">Acesse sua conta</h1>
              <p className="text-sm leading-6 text-[#5b708b]">
                Entre com a conta Google autorizada para acessar seu ambiente de aprendizagem.
              </p>
            </div>

            <div className="mt-7 space-y-4">
              {!isGoogleAuthConfigured ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env.local para habilitar o login.
                </div>
              ) : null}

              {authError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {authError}
                </div>
              ) : null}

              <GoogleSignInButton callbackUrl={callbackUrl} disabled={!isGoogleAuthConfigured} />
            </div>

            <div className="mt-7 border-t border-[#e7eef6] pt-5 text-center">
              <p className="text-xs leading-5 text-[#72849a]">
                Ao continuar, voce concorda com nossos termos de uso e politica de privacidade.
              </p>
              <p className="mt-3 text-sm text-[#5b708b]">
                Precisa de ajuda?{' '}
                <a href={primeSupportUrl} target="_blank" rel="noreferrer" className="font-bold text-[#169b62] hover:underline">
                  Fale com a Prime no WhatsApp
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

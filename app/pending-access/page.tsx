import Link from 'next/link'

export default function PendingAccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Acesso Pendente
          </h1>
          <p className="text-muted-foreground">
            Seu cadastro está sendo processado. Você receberá um e-mail assim
            que seu acesso ao Prime Digital Hub for liberado.
          </p>
        </div>

        {/* Info card */}
        <div className="bg-muted rounded-lg p-4 text-left space-y-2">
          <p className="text-sm font-medium text-foreground">O que acontece agora?</p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Seu professor foi notificado</li>
            <li>A ativação costuma ocorrer em até 24h</li>
            <li>Você receberá um e-mail de confirmação</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="mailto:alex@primedigitalhub.com"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Entrar em contato com o professor
          </Link>
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    </main>
  )
}

import { redirect } from 'next/navigation'

// Redireciona para a rota canônica de pending-access dentro do dashboard
export default function PendingAccessRedirect() {
  redirect('/dashboard/pending-access')
}

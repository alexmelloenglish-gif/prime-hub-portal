import { redirect } from 'next/navigation'

type LegacyMaterialsPageProps = {
  searchParams?: Promise<{
    studentEmail?: string
  }>
}

export default async function LegacyMaterialsPage({ searchParams }: LegacyMaterialsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined

  if (resolvedSearchParams?.studentEmail) {
    redirect(`/dashboard?studentEmail=${encodeURIComponent(resolvedSearchParams.studentEmail)}`)
  }

  redirect('/dashboard')
}

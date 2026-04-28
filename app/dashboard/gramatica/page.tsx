import { redirect } from 'next/navigation'

type LegacyGrammarPageProps = {
  searchParams?: Promise<{
    studentEmail?: string
  }>
}

export default async function LegacyGrammarPage({ searchParams }: LegacyGrammarPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined

  if (resolvedSearchParams?.studentEmail) {
    redirect(`/dashboard/conversacao?studentEmail=${encodeURIComponent(resolvedSearchParams.studentEmail)}`)
  }

  redirect('/dashboard/conversacao')
}

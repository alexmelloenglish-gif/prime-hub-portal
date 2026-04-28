import { redirect } from 'next/navigation'

type LegacyVocabularyPageProps = {
  searchParams?: Promise<{
    studentEmail?: string
  }>
}

export default async function LegacyVocabularyPage({ searchParams }: LegacyVocabularyPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined

  if (resolvedSearchParams?.studentEmail) {
    redirect(`/dashboard/metas?studentEmail=${encodeURIComponent(resolvedSearchParams.studentEmail)}`)
  }

  redirect('/dashboard/metas')
}

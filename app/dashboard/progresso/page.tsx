import { redirect } from 'next/navigation'

type ProgressPageProps = {
  searchParams?: Promise<{
    studentEmail?: string
  }>
}

export default async function DashboardProgressPage({ searchParams }: ProgressPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const params = new URLSearchParams()

  params.set('section', 'progress')

  if (resolvedSearchParams?.studentEmail) {
    params.set('studentEmail', resolvedSearchParams.studentEmail)
  }

  redirect(`/dashboard?${params.toString()}#progress-tracker`)
}

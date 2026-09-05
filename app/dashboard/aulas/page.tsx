import { redirect } from 'next/navigation'

type LessonsPageProps = {
  searchParams?: Promise<{
    studentEmail?: string
  }>
}

export default async function DashboardLessonsPage({ searchParams }: LessonsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const params = new URLSearchParams()

  params.set('section', 'lessons')

  if (resolvedSearchParams?.studentEmail) {
    params.set('studentEmail', resolvedSearchParams.studentEmail)
  }

  redirect(`/dashboard?${params.toString()}#attendance-overview`)
}

import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'
import { getStudentDashboardState } from '@/lib/student-data'

function vocabularyKey(term: string) {
  return term.trim().toLocaleLowerCase('en-US')
}

async function resolveStudent(requestedEmail?: string | null) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null

  const state = await getStudentDashboardState(session.user, requestedEmail || undefined)
  if (!state.hasAccess || !state.student) return null

  return state.student
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const student = await resolveStudent(url.searchParams.get('studentEmail'))

  if (!student) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const prisma = getPrismaClient()
    const sentences = await prisma.vocabularyReuseSentence.findMany({
      where: { studentEmail: student.studentEmail },
      orderBy: [{ createdAt: 'asc' }],
      select: {
        id: true,
        vocabularyKey: true,
        term: true,
        sentence: true,
        lockedAt: true,
      },
    })

    return NextResponse.json({ sentences })
  } catch (error) {
    console.error('[vocabulary-reuse] Failed to load locked sentences', error)
    return NextResponse.json(
      { error: 'Your saved sentences could not be loaded right now.' },
      { status: 503 }
    )
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const studentEmail = typeof body.studentEmail === 'string' ? body.studentEmail : undefined
  const student = await resolveStudent(studentEmail)

  if (!student) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const term = typeof body.term === 'string' ? body.term.trim() : ''
  const sentence = typeof body.sentence === 'string' ? body.sentence.trim() : ''

  if (!term || sentence.length < 3 || sentence.length > 280) {
    return NextResponse.json(
      { error: 'Write one complete sentence between 3 and 280 characters.' },
      { status: 400 }
    )
  }

  const key = vocabularyKey(term)
  const authorizedVocabulary = student.vocabularyBank.find(
    (item) => vocabularyKey(item.term) === key
  )

  if (!authorizedVocabulary) {
    return NextResponse.json(
      { error: 'This vocabulary item is not part of your authorized learning record.' },
      { status: 400 }
    )
  }

  try {
    const prisma = getPrismaClient()
    const existing = await prisma.vocabularyReuseSentence.findFirst({
      where: {
        studentEmail: student.studentEmail,
        vocabularyKey: key,
        sentence,
      },
      select: {
        id: true,
        vocabularyKey: true,
        term: true,
        sentence: true,
        lockedAt: true,
      },
    })

    if (existing) {
      return NextResponse.json({ sentence: existing, alreadyLocked: true })
    }

    const locked = await prisma.vocabularyReuseSentence.create({
      data: {
        studentId: student.studentId || null,
        studentEmail: student.studentEmail,
        vocabularyKey: key,
        term: authorizedVocabulary.term,
        sentence,
      },
      select: {
        id: true,
        vocabularyKey: true,
        term: true,
        sentence: true,
        lockedAt: true,
      },
    })

    return NextResponse.json({ sentence: locked }, { status: 201 })
  } catch (error) {
    console.error('[vocabulary-reuse] Failed to lock student sentence', error)
    return NextResponse.json(
      { error: 'Your sentence was not saved. Please try again.' },
      { status: 503 }
    )
  }
}

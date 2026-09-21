import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { isAdminUser } from '@/lib/student-data'
import { getPrismaClient } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdminUser(session.user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const prisma = getPrismaClient()
  const submission = await prisma.audioMissionSubmission.findUnique({ where: { id } })
  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return new Response(Buffer.from(submission.audioBase64, 'base64'), {
    headers: { 'Content-Type': submission.mimeType, 'Cache-Control': 'private, no-store' },
  })
}

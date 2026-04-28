import { NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/prisma'

export async function GET() {
  try {
    const prisma = getPrismaClient()
    const admins = [
      { email: 'alexandre@primedigitalhub.com.br', name: 'Alexandre', role: 'admin' },
      { email: 'alexmello.english@gmail.com', name: 'Alex Mello', role: 'admin' },
      { email: 'hubprimedigital00@gmail.com', name: 'Prime Digital Hub', role: 'admin' },
    ]

    const results = []
    for (const admin of admins) {
      const user = await prisma.user.upsert({
        where: { email: admin.email },
        update: { role: admin.role },
        create: { email: admin.email, name: admin.name, role: admin.role },
      })
      results.push(`✅ Admin: ${user.email}`)
    }

    return NextResponse.json({ message: 'Seed completed!', results })
  } catch (error) {
    return NextResponse.json(
      { message: 'Seed failed', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

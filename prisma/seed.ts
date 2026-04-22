import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Administradores
  const admins = [
    {
      email: 'alexandre@primedigitalhub.com.br',
      name: 'Alexandre',
      role: 'admin',
    },
    {
      email: 'alexmello.english@gmail.com',
      name: 'Alex Mello',
      role: 'admin',
    },
    {
      email: 'hubprimedigital00@gmail.com',
      name: 'Prime Digital Hub',
      role: 'admin',
    },
  ]

  for (const admin of admins) {
    await prisma.user.upsert({
      where: { email: admin.email },
      update: { role: admin.role },
      create: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    })
    console.log(`✅ Admin cadastrado: ${admin.email}`)
  }

  console.log('✅ Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

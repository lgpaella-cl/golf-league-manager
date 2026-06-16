import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.activityFeed.deleteMany({})
  await prisma.invitation.deleteMany({})
  await prisma.achievement.deleteMany({})
  await prisma.seasonRanking.deleteMany({})
  await prisma.roundAward.deleteMany({})
  await prisma.roundScore.deleteMany({})
  await prisma.round.deleteMany({})
  await prisma.player.deleteMany({})
  await prisma.season.deleteMany({})
  await prisma.organizationSettings.deleteMany({})

  const p = await prisma.player.count()
  const r = await prisma.round.count()
  const s = await prisma.season.count()
  console.log(`✅ Limpio — Jugadores: ${p} | Rondas: ${r} | Temporadas: ${s}`)
}

main().finally(() => prisma.$disconnect())

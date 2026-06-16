import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding Golf League Manager...')

  // ─── Organización ───────────────────────
  const org = await prisma.organization.upsert({
    where: { slug: 'liga-golf-demo' },
    update: {},
    create: {
      name: 'Liga de Golf Amateur Santiago',
      slug: 'liga-golf-demo',
      isActive: true,
    },
  })
  console.log('✅ Organización:', org.name)

  // ─── Settings ───────────────────────────
  await prisma.organizationSettings.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      scoringSystem: 'POINTS',
      pointsConfig: { positions: [100, 90, 85, 80, 76, 72, 68, 64, 60, 56], participation: 40 },
      maxRoundsPerMonth: 2,
      validMonthsCount: 6,
      autoDiscards: 1,
    },
  })

  // ─── Admin user ─────────────────────────
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@golf-demo.com' },
    update: {},
    create: {
      email: 'admin@golf-demo.com',
      name: 'Administrador Liga',
      hashedPassword,
    },
  })

  await prisma.orgMembership.upsert({
    where: { userId_organizationId: { userId: adminUser.id, organizationId: org.id } },
    update: {},
    create: { userId: adminUser.id, organizationId: org.id, role: 'ADMIN' },
  })
  console.log('✅ Admin: admin@golf-demo.com / admin123')

  // ─── Temporada activa ────────────────────
  const season = await prisma.season.upsert({
    where: { id: 'season-clausura-2026' },
    update: { isActive: true },
    create: {
      id: 'season-clausura-2026',
      organizationId: org.id,
      name: 'Clausura 2026',
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
      maxRoundsPerMonth: 2,
      autoDiscards: 1,
      pointsConfig: { positions: [100, 90, 85, 80, 76, 72, 68, 64, 60, 56], participation: 40 },
    },
  })
  console.log('✅ Temporada:', season.name)

  // ─── Jugadores ───────────────────────────
  const playersData = [
    { fullName: 'Guillermo Achondo', email: 'guillermo@golf.com', handicapIndex: 18.4 },
    { fullName: 'Pedro Fernández', email: 'pedro@golf.com', handicapIndex: 22.1 },
    { fullName: 'Nicolás Vargas', email: 'nicolas@golf.com', handicapIndex: 15.7 },
    { fullName: 'Juan Pérez', email: 'juan@golf.com', handicapIndex: 28.0 },
    { fullName: 'Carlos Mendoza', email: 'carlos@golf.com', handicapIndex: 20.5 },
    { fullName: 'Felipe Castro', email: 'felipe@golf.com', handicapIndex: 12.3 },
    { fullName: 'Rodrigo Morales', email: 'rodrigo@golf.com', handicapIndex: 25.8 },
    { fullName: 'Andrés López', email: 'andres@golf.com', handicapIndex: 19.2 },
  ]

  const players: { id: string; fullName: string; handicapIndex: number | null }[] = []
  for (const pd of playersData) {
    const slug = pd.fullName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const p = await prisma.player.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug } },
      update: {},
      create: {
        organizationId: org.id,
        fullName: pd.fullName,
        slug,
        email: pd.email,
        handicapIndex: pd.handicapIndex,
        isActive: true,
      },
    })
    players.push(p)
  }
  console.log(`✅ ${players.length} jugadores creados`)

  // ─── Rondas demo ────────────────────────
  const clubs = ['Club de Golf Maipo', 'Club de Polo', 'Haras del Bosque', 'Los Leones Golf Club', 'Príncipe de Gales']
  const rounds = [
    { player: 0, gross: 85, month: 7, day: 12, club: clubs[0] },
    { player: 1, gross: 92, month: 7, day: 12, club: clubs[0] },
    { player: 2, gross: 78, month: 7, day: 15, club: clubs[1] },
    { player: 3, gross: 98, month: 7, day: 18, club: clubs[2] },
    { player: 4, gross: 88, month: 7, day: 20, club: clubs[3] },
    { player: 5, gross: 76, month: 7, day: 22, club: clubs[4] },
    { player: 0, gross: 82, month: 8, day: 5, club: clubs[1] },
    { player: 1, gross: 89, month: 8, day: 8, club: clubs[0] },
    { player: 2, gross: 75, month: 8, day: 10, club: clubs[2] },
    { player: 6, gross: 95, month: 8, day: 14, club: clubs[3] },
    { player: 7, gross: 91, month: 8, day: 16, club: clubs[4] },
  ]

  for (const r of rounds) {
    const player = players[r.player]
    const hcp = Math.round(player.handicapIndex ?? 18)
    const net = r.gross - hcp
    const points = r.player === 0 ? 100 : r.player === 2 ? 90 : 85

    await prisma.round.create({
      data: {
        organizationId: org.id,
        seasonId: season.id,
        playerId: player.id,
        playedAt: new Date(`2026-${String(r.month).padStart(2, '0')}-${String(r.day).padStart(2, '0')}`),
        clubName: r.club,
        grossScore: r.gross,
        netScore: net,
        handicapUsed: hcp,
        birdies: Math.floor(Math.random() * 3),
        eagles: 0,
        pars: Math.floor(Math.random() * 5) + 3,
        points,
        witnessName: 'Compañero de juego',
        status: 'APPROVED',
        approvedById: adminUser.id,
        approvedAt: new Date(),
      },
    })
  }
  console.log(`✅ ${rounds.length} rondas creadas (aprobadas)`)

  // ─── Actividad ──────────────────────────
  await prisma.activityFeed.createMany({
    data: [
      { organizationId: org.id, type: 'SEASON_START', message: 'Temporada Clausura 2026 ha comenzado. ¡A jugar!' },
      { organizationId: org.id, playerId: players[2].id, playerName: players[2].fullName, type: 'ROUND_APPROVED', message: `${players[2].fullName} registró la mejor ronda del mes con 78 golpes en ${clubs[1]}.` },
      { organizationId: org.id, playerId: players[5].id, playerName: players[5].fullName, type: 'RANKING_UPDATE', message: `${players[5].fullName} tomó el liderato del ranking mensual con 76 golpes.` },
      { organizationId: org.id, type: 'ACHIEVEMENT_UNLOCKED', message: '¡Nuevos logros desbloqueados esta semana!' },
    ],
  })

  console.log('✅ Feed de actividad creado')
  console.log('')
  console.log('─────────────────────────────────────')
  console.log('🏌️  Seed completado exitosamente!')
  console.log('─────────────────────────────────────')
  console.log('URL:      http://localhost:3000/login')
  console.log('Email:    admin@golf-demo.com')
  console.log('Password: admin123')
  console.log('─────────────────────────────────────')
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())

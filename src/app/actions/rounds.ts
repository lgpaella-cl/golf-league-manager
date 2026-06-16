'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

const RoundSchema = z.object({
  playerId: z.string().min(1),
  seasonId: z.string().min(1),
  playedAt: z.string().min(1),
  clubName: z.string().optional(),
  grossScore: z.coerce.number().min(40).max(200).optional().or(z.literal('')),
  netScore: z.coerce.number().min(30).max(180).optional().or(z.literal('')),
  handicapUsed: z.coerce.number().min(0).max(54).optional().or(z.literal('')),
  birdies: z.coerce.number().min(0).default(0),
  eagles: z.coerce.number().min(0).default(0),
  pars: z.coerce.number().min(0).default(0),
  witnessName: z.string().optional(),
  notes: z.string().optional(),
})

export type RoundState = { error: string | null; success: boolean }

export async function createRound(prevState: RoundState, formData: FormData): Promise<RoundState> {
  const session = await getSession()
  if (!session || !['ADMIN', 'SUPERADMIN'].includes(session.role)) {
    return { error: 'No autorizado', success: false }
  }

  const parsed = RoundSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos', success: false }

  const d = parsed.data
  const gross = d.grossScore !== '' && d.grossScore != null ? Number(d.grossScore) : null
  const hcp = d.handicapUsed !== '' && d.handicapUsed != null ? Number(d.handicapUsed) : null
  const net = d.netScore !== '' && d.netScore != null ? Number(d.netScore) : (gross != null && hcp != null ? gross - hcp : null)

  try {
    await prisma.round.create({
      data: {
        organizationId: session.organizationId,
        playerId: d.playerId,
        seasonId: d.seasonId,
        playedAt: new Date(d.playedAt),
        clubName: d.clubName || null,
        grossScore: gross,
        netScore: net,
        handicapUsed: hcp,
        birdies: d.birdies,
        eagles: d.eagles,
        pars: d.pars,
        witnessName: d.witnessName || null,
        notes: d.notes || null,
        status: 'PENDING',
      },
    })

    // Feed de actividad
    const player = await prisma.player.findUnique({ where: { id: d.playerId }, select: { fullName: true } })
    if (player) {
      await prisma.activityFeed.create({
        data: {
          organizationId: session.organizationId,
          playerId: d.playerId,
          playerName: player.fullName,
          type: 'ROUND_SUBMITTED',
          message: `${player.fullName} registró una ronda${gross ? ` de ${gross} golpes` : ''}${d.clubName ? ` en ${d.clubName}` : ''}.`,
        },
      })
    }

    revalidatePath('/admin/rounds')
    return { error: null, success: true }
  } catch (e: any) {
    return { error: e.message ?? 'Error al crear ronda', success: false }
  }
}

export async function approveRound(id: string) {
  const session = await getSession()
  if (!session || !['ADMIN', 'SUPERADMIN'].includes(session.role)) return

  const round = await prisma.round.findUnique({
    where: { id },
    include: { player: { select: { fullName: true } } },
  })
  if (!round) return

  await prisma.round.update({
    where: { id },
    data: { status: 'APPROVED', approvedById: session.userId, approvedAt: new Date() },
  })

  await prisma.activityFeed.create({
    data: {
      organizationId: round.organizationId,
      playerId: round.playerId,
      playerName: round.player.fullName,
      type: 'ROUND_APPROVED',
      message: `Ronda de ${round.player.fullName}${round.grossScore ? ` (${round.grossScore} golpes)` : ''} fue aprobada.`,
    },
  })

  revalidatePath('/admin/rounds')
  revalidatePath('/admin')
}

export async function rejectRound(id: string, reason: string) {
  const session = await getSession()
  if (!session || !['ADMIN', 'SUPERADMIN'].includes(session.role)) return

  await prisma.round.update({
    where: { id },
    data: { status: 'REJECTED', rejectionReason: reason },
  })

  revalidatePath('/admin/rounds')
}

export async function deleteRound(id: string) {
  const session = await getSession()
  if (!session || !['ADMIN', 'SUPERADMIN'].includes(session.role)) return
  await prisma.round.delete({ where: { id } })
  revalidatePath('/admin/rounds')
}

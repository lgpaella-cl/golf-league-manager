'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

const SeasonSchema = z.object({
  name: z.string().min(3),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  maxRoundsPerMonth: z.coerce.number().min(1).max(10).default(2),
  autoDiscards: z.coerce.number().min(0).max(5).default(1),
})

export type SeasonState = { error: string | null; success: boolean }

export async function createSeason(prevState: SeasonState, formData: FormData): Promise<SeasonState> {
  const session = await getSession()
  if (!session || !['ADMIN', 'SUPERADMIN'].includes(session.role)) {
    return { error: 'No autorizado', success: false }
  }

  const parsed = SeasonSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos', success: false }

  const d = parsed.data
  try {
    await prisma.season.create({
      data: {
        organizationId: session.organizationId,
        name: d.name,
        startDate: new Date(d.startDate),
        endDate: new Date(d.endDate),
        maxRoundsPerMonth: d.maxRoundsPerMonth,
        autoDiscards: d.autoDiscards,
        isActive: false,
      },
    })
    revalidatePath('/admin/seasons')
    return { error: null, success: true }
  } catch (e: any) {
    return { error: e.message ?? 'Error', success: false }
  }
}

export async function activateSeason(id: string) {
  const session = await getSession()
  if (!session || !['ADMIN', 'SUPERADMIN'].includes(session.role)) return

  await prisma.season.updateMany({
    where: { organizationId: session.organizationId },
    data: { isActive: false },
  })
  await prisma.season.update({ where: { id }, data: { isActive: true } })

  await prisma.activityFeed.create({
    data: {
      organizationId: session.organizationId,
      type: 'SEASON_START',
      message: 'Nueva temporada activada.',
    },
  })

  revalidatePath('/admin/seasons')
  revalidatePath('/admin')
}

export async function updateSettings(prevState: { error: string | null; success: boolean }, formData: FormData) {
  const session = await getSession()
  if (!session || !['ADMIN', 'SUPERADMIN'].includes(session.role)) {
    return { error: 'No autorizado', success: false }
  }

  const name = formData.get('name') as string
  const maxRoundsPerMonth = Number(formData.get('maxRoundsPerMonth') ?? 2)
  const autoDiscards = Number(formData.get('autoDiscards') ?? 1)
  const validMonthsCount = Number(formData.get('validMonthsCount') ?? 6)

  try {
    await prisma.organization.update({
      where: { id: session.organizationId },
      data: { name },
    })
    await prisma.organizationSettings.upsert({
      where: { organizationId: session.organizationId },
      create: { organizationId: session.organizationId, maxRoundsPerMonth, autoDiscards, validMonthsCount },
      update: { maxRoundsPerMonth, autoDiscards, validMonthsCount },
    })
    revalidatePath('/admin/settings')
    revalidatePath('/admin')
    return { error: null, success: true }
  } catch (e: any) {
    return { error: e.message ?? 'Error', success: false }
  }
}

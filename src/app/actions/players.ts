'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { slugify } from '@/lib/utils'

const PlayerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  handicapIndex: z.coerce.number().min(0).max(54).optional().or(z.literal('')),
  joinedAt: z.string().optional(),
})

export type PlayerState = { error: string | null; success: boolean }

export async function createPlayer(prevState: PlayerState, formData: FormData): Promise<PlayerState> {
  const session = await getSession()
  if (!session || !['ADMIN', 'SUPERADMIN'].includes(session.role)) {
    return { error: 'No autorizado', success: false }
  }

  const parsed = PlayerSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    handicapIndex: formData.get('handicapIndex'),
    joinedAt: formData.get('joinedAt'),
  })

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos', success: false }

  const { fullName, email, phone, handicapIndex, joinedAt } = parsed.data

  try {
    let slug = slugify(fullName)
    const exists = await prisma.player.findUnique({ where: { organizationId_slug: { organizationId: session.organizationId, slug } } })
    if (exists) slug = `${slug}-${Date.now().toString(36)}`

    await prisma.player.create({
      data: {
        organizationId: session.organizationId,
        fullName,
        slug,
        email: email || null,
        phone: phone || null,
        handicapIndex: handicapIndex !== '' ? Number(handicapIndex) : null,
        joinedAt: joinedAt ? new Date(joinedAt) : new Date(),
      },
    })

    revalidatePath('/admin/players')
    return { error: null, success: true }
  } catch (e: any) {
    return { error: e.message ?? 'Error al crear jugador', success: false }
  }
}

export async function updatePlayer(id: string, prevState: PlayerState, formData: FormData): Promise<PlayerState> {
  const session = await getSession()
  if (!session || !['ADMIN', 'SUPERADMIN'].includes(session.role)) {
    return { error: 'No autorizado', success: false }
  }

  const parsed = PlayerSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    handicapIndex: formData.get('handicapIndex'),
    joinedAt: formData.get('joinedAt'),
  })

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos', success: false }

  const { fullName, email, phone, handicapIndex, joinedAt } = parsed.data

  try {
    await prisma.player.update({
      where: { id },
      data: {
        fullName,
        email: email || null,
        phone: phone || null,
        handicapIndex: handicapIndex !== '' ? Number(handicapIndex) : null,
        joinedAt: joinedAt ? new Date(joinedAt) : undefined,
      },
    })
    revalidatePath('/admin/players')
    return { error: null, success: true }
  } catch (e: any) {
    return { error: e.message ?? 'Error al actualizar', success: false }
  }
}

export async function togglePlayerActive(id: string, isActive: boolean) {
  const session = await getSession()
  if (!session || !['ADMIN', 'SUPERADMIN'].includes(session.role)) return
  await prisma.player.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/players')
}

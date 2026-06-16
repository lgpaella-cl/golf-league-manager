'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSession, createSession } from '@/lib/session'
import { sendInvitationEmail } from '@/lib/email'

export async function sendInvitation(playerId: string): Promise<{ error: string | null; success: boolean }> {
  const session = await getSession()
  if (!session || !['ADMIN', 'SUPERADMIN'].includes(session.role)) {
    return { error: 'No autorizado', success: false }
  }

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: { organization: true },
  })

  if (!player) return { error: 'Jugador no encontrado', success: false }
  if (!player.email) return { error: 'El jugador no tiene email registrado', success: false }
  if (player.userId) return { error: 'El jugador ya tiene cuenta activa', success: false }

  // Invalidar invitaciones previas del mismo jugador
  await prisma.invitation.updateMany({
    where: { playerId, usedAt: null },
    data: { expiresAt: new Date() },
  })

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const invitation = await prisma.invitation.create({
    data: {
      organizationId: player.organizationId,
      playerId: player.id,
      email: player.email,
      expiresAt,
    },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const inviteUrl = `${appUrl}/invite/${invitation.token}`

  try {
    await sendInvitationEmail({
      to: player.email,
      playerName: player.fullName,
      leagueName: player.organization.name,
      inviteUrl,
    })
  } catch {
    await prisma.invitation.delete({ where: { id: invitation.id } })
    return { error: 'Error al enviar el email. Verifica la configuración de Resend.', success: false }
  }

  revalidatePath('/admin/players')
  return { error: null, success: true }
}

export async function acceptInvitationAction(
  token: string,
  _prev: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const name = formData.get('name') as string
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (!name?.trim()) return { error: 'El nombre es requerido' }
  if (password.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres' }
  if (password !== confirm) return { error: 'Las contraseñas no coinciden' }

  return acceptInvitation(token, name.trim(), password)
}

async function acceptInvitation(
  token: string,
  name: string,
  password: string
): Promise<{ error: string | null }> {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { player: true, organization: true },
  })

  if (!invitation) return { error: 'Invitación no encontrada' }
  if (invitation.usedAt) return { error: 'Esta invitación ya fue utilizada' }
  if (invitation.expiresAt < new Date()) return { error: 'Esta invitación ha expirado' }

  const existingUser = await prisma.user.findUnique({ where: { email: invitation.email } })
  if (existingUser) return { error: 'Ya existe una cuenta con este email' }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      email: invitation.email,
      name,
      hashedPassword,
    },
  })

  await prisma.orgMembership.create({
    data: {
      userId: user.id,
      organizationId: invitation.organizationId,
      role: 'PLAYER',
    },
  })

  if (invitation.playerId) {
    await prisma.player.update({
      where: { id: invitation.playerId },
      data: { userId: user.id },
    })
  }

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { usedAt: new Date() },
  })

  await createSession({
    userId: user.id,
    organizationId: invitation.organizationId,
    role: 'PLAYER',
    email: user.email,
    name: user.name,
    playerId: invitation.playerId ?? undefined,
  })

  redirect('/portal')
}

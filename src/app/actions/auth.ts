'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createSession, deleteSession } from '@/lib/session'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export type AuthState = { error: string | null }

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) return { error: 'Email o contraseña inválidos' }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: { take: 1 },
      player: true,
    },
  })

  if (!user || !user.hashedPassword) return { error: 'Credenciales incorrectas' }

  const valid = await bcrypt.compare(password, user.hashedPassword)
  if (!valid) return { error: 'Credenciales incorrectas' }

  const membership = user.memberships[0]
  if (!membership) return { error: 'No tienes acceso a ninguna organización' }

  await createSession({
    userId: user.id,
    organizationId: membership.organizationId,
    role: membership.role,
    email: user.email,
    name: user.name,
    playerId: user.player?.id,
  })

  if (membership.role === 'PLAYER') redirect('/portal')
  redirect('/admin')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { acceptInvitationAction } from '@/app/actions/invitations'
import { AcceptForm } from './accept-form'

interface Props {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { player: true, organization: true },
  })

  if (!invitation) notFound()

  const expired = invitation.expiresAt < new Date()
  const used = !!invitation.usedAt

  const action = acceptInvitationAction.bind(null, token)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 to-green-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⛳</div>
          <h1 className="text-2xl font-bold text-white">{invitation.organization.name}</h1>
          <p className="text-green-300 text-sm mt-1">Plataforma de Liga Amateur</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {used ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">✅</div>
              <h2 className="text-lg font-bold text-gray-900">Invitación ya utilizada</h2>
              <p className="text-gray-500 text-sm mt-2">Esta invitación ya fue aceptada. Puedes iniciar sesión directamente.</p>
              <a href="/login" className="mt-4 inline-block text-green-700 font-medium hover:underline text-sm">
                Ir al login →
              </a>
            </div>
          ) : expired ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">⏰</div>
              <h2 className="text-lg font-bold text-gray-900">Invitación expirada</h2>
              <p className="text-gray-500 text-sm mt-2">Este link expiró. Pide al administrador que te envíe una nueva invitación.</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Crea tu cuenta</h2>
              <p className="text-gray-500 text-sm mb-6">
                Hola, <strong>{invitation.player?.fullName ?? invitation.email}</strong>. Elige una contraseña para acceder a la liga.
              </p>
              <AcceptForm
                action={action}
                defaultName={invitation.player?.fullName ?? ''}
                email={invitation.email}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

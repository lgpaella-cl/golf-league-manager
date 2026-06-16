import { redirect } from 'next/navigation'
import { Plus, UserX, UserCheck } from 'lucide-react'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { Table, Thead, Tbody, Th, Td } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { PlayerAvatar } from '@/components/shared/PlayerAvatar'
import { formatDate, formatHandicap } from '@/lib/utils'
import { PlayerDialog } from './player-dialog'
import { ToggleActiveButton } from './toggle-active-button'
import { InviteButton } from './invite-button'
import { DeletePlayerButton } from './delete-player-button'

export const metadata = { title: 'Jugadores' }

export default async function PlayersPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const players = await prisma.player.findMany({
    where: { organizationId: session.organizationId },
    orderBy: [{ isActive: 'desc' }, { fullName: 'asc' }],
    include: {
      _count: { select: { rounds: { where: { status: 'APPROVED' } } } },
    },
  })

  const invitedPlayerIds = await prisma.invitation.findMany({
    where: {
      organizationId: session.organizationId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: { playerId: true },
  }).then((rows) => new Set(rows.map((r) => r.playerId)))

  const active = players.filter((p) => p.isActive).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jugadores</h1>
          <p className="text-gray-500 text-sm mt-1">{active} activos · {players.length} total</p>
        </div>
        <PlayerDialog mode="create">
          <button className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors">
            <Plus size={16} />
            Agregar jugador
          </button>
        </PlayerDialog>
      </div>

      <Table>
        <Thead>
          <tr>
            <Th>Jugador</Th>
            <Th>Handicap</Th>
            <Th>Email</Th>
            <Th>Ingresó</Th>
            <Th className="text-center">Rondas</Th>
            <Th className="text-center">Estado</Th>
            <Th className="text-center">Acceso</Th>
            <Th className="text-right">Acciones</Th>
          </tr>
        </Thead>
        <Tbody>
          {players.length === 0 ? (
            <tr><Td colSpan={8} className="text-center text-gray-400 py-12">No hay jugadores registrados</Td></tr>
          ) : players.map((player) => (
            <tr key={player.id} className="hover:bg-gray-50 transition-colors">
              <Td>
                <div className="flex items-center gap-3">
                  <PlayerAvatar name={player.fullName} photoUrl={player.photoUrl} size="sm" />
                  <div>
                    <p className="font-medium text-gray-900">{player.fullName}</p>
                    {player.phone && <p className="text-xs text-gray-400">{player.phone}</p>}
                  </div>
                </div>
              </Td>
              <Td><span className="font-mono font-medium">{formatHandicap(player.handicapIndex)}</span></Td>
              <Td className="text-gray-500">{player.email ?? '—'}</Td>
              <Td className="text-gray-500">{formatDate(player.joinedAt)}</Td>
              <Td className="text-center font-medium">{player._count.rounds}</Td>
              <Td className="text-center">
                <Badge variant={player.isActive ? 'green' : 'gray'}>
                  {player.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </Td>
              <Td className="text-center">
                {player.userId ? (
                  <span className="text-xs text-green-700 font-medium">✓ Activo</span>
                ) : invitedPlayerIds.has(player.id) ? (
                  <span className="text-xs text-blue-600">Invitado</span>
                ) : player.email ? (
                  <InviteButton playerId={player.id} />
                ) : (
                  <span className="text-xs text-gray-300">Sin email</span>
                )}
              </Td>
              <Td>
                <div className="flex items-center gap-2 justify-end">
                  <PlayerDialog mode="edit" player={player}>
                    <button className="text-xs text-gray-500 hover:text-green-700 px-2 py-1 rounded hover:bg-green-50 transition-colors">
                      Editar
                    </button>
                  </PlayerDialog>
                  <ToggleActiveButton id={player.id} isActive={player.isActive} />
                  <DeletePlayerButton id={player.id} name={player.fullName} />
                </div>
              </Td>
            </tr>
          ))}
        </Tbody>
      </Table>
    </div>
  )
}

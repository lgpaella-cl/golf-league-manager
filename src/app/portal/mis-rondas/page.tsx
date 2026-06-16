import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { Table, Thead, Tbody, Th, Td } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export const metadata = { title: 'Mis Rondas' }

export default async function MisRondasPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const player = session.playerId
    ? await prisma.player.findUnique({ where: { id: session.playerId } })
    : await prisma.player.findFirst({ where: { userId: session.userId } })

  if (!player) {
    return (
      <div className="text-center py-20 text-gray-400">
        No se encontró tu perfil de jugador.
      </div>
    )
  }

  const rounds = await prisma.round.findMany({
    where: { playerId: player.id },
    include: { season: { select: { name: true } } },
    orderBy: { playedAt: 'desc' },
  })

  const statusColor: Record<string, 'gold' | 'green' | 'red'> = {
    PENDING: 'gold',
    APPROVED: 'green',
    REJECTED: 'red',
  }
  const statusLabel: Record<string, string> = {
    PENDING: 'Pendiente',
    APPROVED: 'Aprobada',
    REJECTED: 'Rechazada',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Rondas</h1>
        <p className="text-gray-500 text-sm mt-1">{rounds.length} rondas registradas</p>
      </div>

      <Table>
        <Thead>
          <tr>
            <Th>Fecha</Th>
            <Th>Temporada</Th>
            <Th>Club</Th>
            <Th className="text-center">Gross</Th>
            <Th className="text-center">Net</Th>
            <Th className="text-center">HCP</Th>
            <Th className="text-center">Estado</Th>
          </tr>
        </Thead>
        <Tbody>
          {rounds.length === 0 ? (
            <tr>
              <Td colSpan={7} className="text-center text-gray-400 py-12">
                No tienes rondas registradas
              </Td>
            </tr>
          ) : rounds.map((round) => (
            <tr key={round.id} className="hover:bg-gray-50 transition-colors">
              <Td>{formatDate(round.playedAt)}</Td>
              <Td className="text-gray-500 text-xs">{round.season.name}</Td>
              <Td className="text-gray-600">{round.clubName ?? '—'}</Td>
              <Td className="text-center font-mono font-medium">{round.grossScore ?? '—'}</Td>
              <Td className="text-center font-mono font-medium">{round.netScore ?? '—'}</Td>
              <Td className="text-center font-mono text-gray-500">{round.handicapUsed ?? '—'}</Td>
              <Td className="text-center">
                <Badge variant={statusColor[round.status] ?? 'gray'}>
                  {statusLabel[round.status] ?? round.status}
                </Badge>
                {round.status === 'REJECTED' && round.rejectionReason && (
                  <p className="text-xs text-red-500 mt-0.5">{round.rejectionReason}</p>
                )}
              </Td>
            </tr>
          ))}
        </Tbody>
      </Table>
    </div>
  )
}

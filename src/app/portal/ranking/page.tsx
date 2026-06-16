import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { calculateSeasonRanking } from '@/lib/scoring'
import { Table, Thead, Tbody, Th, Td } from '@/components/ui/table'
import { PlayerAvatar } from '@/components/shared/PlayerAvatar'
import { ordinal } from '@/lib/utils'

export const metadata = { title: 'Ranking' }

export default async function PortalRankingPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const player = session.playerId
    ? await prisma.player.findUnique({ where: { id: session.playerId } })
    : await prisma.player.findFirst({ where: { userId: session.userId } })

  const season = await prisma.season.findFirst({
    where: { organizationId: session.organizationId, isActive: true },
  })

  if (!season) {
    return (
      <div className="text-center py-20 text-gray-400">
        No hay temporada activa en este momento.
      </div>
    )
  }

  const rounds = await prisma.round.findMany({
    where: { seasonId: season.id, status: 'APPROVED' },
  })

  const players = await prisma.player.findMany({
    where: { organizationId: session.organizationId, isActive: true },
  })

  const playerMap = new Map(players.map((p) => [p.id, p]))

  const pc = season.pointsConfig as any
  const rankingMap = calculateSeasonRanking(
    rounds,
    { positions: pc?.positions ?? [100,90,85,80,76,72,68,64,60,56], participation: pc?.participation ?? 40 },
    season.autoDiscards
  )

  const sorted = [...rankingMap.values()]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((r, i) => ({ ...r, position: i + 1 }))

  const posColor = (p: number) =>
    p === 1 ? 'text-yellow-500' : p === 2 ? 'text-gray-400' : p === 3 ? 'text-amber-600' : 'text-gray-400'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ranking — {season.name}</h1>
        <p className="text-gray-500 text-sm mt-1">{sorted.length} jugadores · Solo rondas aprobadas</p>
      </div>

      <Table>
        <Thead>
          <tr>
            <Th className="text-center w-12">#</Th>
            <Th>Jugador</Th>
            <Th className="text-center">Puntos</Th>
            <Th className="text-center">Meses</Th>
            <Th className="text-center">Rondas</Th>
          </tr>
        </Thead>
        <Tbody>
          {sorted.length === 0 ? (
            <tr>
              <Td colSpan={5} className="text-center text-gray-400 py-12">
                No hay datos de ranking aún
              </Td>
            </tr>
          ) : sorted.map((row) => {
            const p = playerMap.get(row.playerId)
            const isMe = player?.id === row.playerId
            return (
              <tr
                key={row.playerId}
                className={isMe ? 'bg-green-50 font-medium' : 'hover:bg-gray-50 transition-colors'}
              >
                <Td className={`text-center font-bold text-lg ${posColor(row.position)}`}>
                  {row.position <= 3 ? ['🥇', '🥈', '🥉'][row.position - 1] : row.position}
                </Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <PlayerAvatar name={p?.fullName ?? '?'} photoUrl={p?.photoUrl} size="sm" />
                    <div>
                      <span className="font-medium text-gray-900">{p?.fullName ?? row.playerId}</span>
                      {isMe && <span className="ml-2 text-xs text-green-700 font-normal">(tú)</span>}
                    </div>
                  </div>
                </Td>
                <Td className="text-center font-bold text-green-800">{row.totalPoints}</Td>
                <Td className="text-center text-gray-600">{row.monthsPlayed}</Td>
                <Td className="text-center text-gray-600">{row.roundsPlayed}</Td>
              </tr>
            )
          })}
        </Tbody>
      </Table>
    </div>
  )
}

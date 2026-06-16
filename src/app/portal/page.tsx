import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { calculateSeasonRanking } from '@/lib/scoring'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatHandicap, ordinal } from '@/lib/utils'

export const metadata = { title: 'Mi Portal' }

export default async function PortalPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const player = session.playerId
    ? await prisma.player.findUnique({ where: { id: session.playerId } })
    : await prisma.player.findFirst({ where: { userId: session.userId } })

  const season = await prisma.season.findFirst({
    where: { organizationId: session.organizationId, isActive: true },
  })

  const myRounds = player && season
    ? await prisma.round.findMany({
        where: { playerId: player.id, seasonId: season.id },
        orderBy: { playedAt: 'desc' },
        take: 5,
      })
    : []

  let myPosition: number | null = null
  let myPoints = 0

  if (player && season) {
    const allRounds = await prisma.round.findMany({
      where: { seasonId: season.id, status: 'APPROVED' },
    })
    const pc = season.pointsConfig as any
    const ranking = calculateSeasonRanking(
      allRounds,
      { positions: pc?.positions ?? [100,90,85,80,76,72,68,64,60,56], participation: pc?.participation ?? 40 },
      season.autoDiscards
    )
    const sorted = [...ranking.values()].sort((a, b) => b.totalPoints - a.totalPoints)
    const idx = sorted.findIndex((r) => r.playerId === player.id)
    if (idx >= 0) {
      myPosition = idx + 1
      myPoints = sorted[idx].totalPoints
    }
  }

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
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hola, {player?.fullName ?? session.name ?? 'Jugador'} 👋</h1>
        {season && <p className="text-gray-500 text-sm mt-1">Temporada activa: {season.name}</p>}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Mi posición</p>
          <p className="text-4xl font-bold text-green-800 mt-1">
            {myPosition ? ordinal(myPosition) : '—'}
          </p>
          <p className="text-sm text-gray-500 mt-1">{myPoints} puntos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Handicap</p>
          <p className="text-4xl font-bold text-green-800 mt-1">
            {formatHandicap(player?.handicapIndex ?? null)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Índice actual</p>
        </div>
      </div>

      {/* Recent rounds */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Últimas rondas</h2>
        </div>
        {myRounds.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">No hay rondas registradas aún</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {myRounds.map((round) => (
              <li key={round.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {round.clubName ?? 'Sin club'} · {formatDate(round.playedAt)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Gross: {round.grossScore ?? '—'} · Net: {round.netScore ?? '—'}
                  </p>
                </div>
                <Badge variant={statusColor[round.status] ?? 'gray'}>
                  {statusLabel[round.status] ?? round.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

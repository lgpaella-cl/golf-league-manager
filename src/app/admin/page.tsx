import { redirect } from 'next/navigation'
import { Users, Flag, Clock, CheckCircle, Trophy, TrendingUp } from 'lucide-react'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { StatCard, Card } from '@/components/ui/card'
import { Badge, RoundStatusBadge } from '@/components/ui/badge'
import { PlayerAvatar } from '@/components/shared/PlayerAvatar'
import { formatDate } from '@/lib/utils'
import { calculateSeasonRanking } from '@/lib/scoring'

export const metadata = { title: 'Dashboard' }

export default async function AdminDashboard() {
  const session = await getSession()
  if (!session) redirect('/login')

  const orgId = session.organizationId

  const [totalPlayers, pendingRounds, approvedRounds, recentRounds, activeSeason, recentActivity] = await Promise.all([
    prisma.player.count({ where: { organizationId: orgId, isActive: true } }),
    prisma.round.count({ where: { organizationId: orgId, status: 'PENDING' } }),
    prisma.round.count({ where: { organizationId: orgId, status: 'APPROVED' } }),
    prisma.round.findMany({
      where: { organizationId: orgId },
      include: { player: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.season.findFirst({ where: { organizationId: orgId, isActive: true } }),
    prisma.activityFeed.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  // Ranking top 5 de la temporada activa
  let top5: { playerId: string; fullName: string; photoUrl: string | null; totalPoints: number; position: number }[] = []
  if (activeSeason) {
    const rounds = await prisma.round.findMany({
      where: { organizationId: orgId, seasonId: activeSeason.id, status: 'APPROVED' },
      select: { id: true, playerId: true, grossScore: true, netScore: true, points: true, birdies: true, eagles: true, pars: true, playedAt: true, status: true },
    })
    const players = await prisma.player.findMany({
      where: { organizationId: orgId },
      select: { id: true, fullName: true, photoUrl: true },
    })
    const config = activeSeason.pointsConfig as { positions: number[]; participation: number }
    const rankingMap = calculateSeasonRanking(rounds, config, activeSeason.autoDiscards)
    const entries = Array.from(rankingMap.values()).sort((a, b) => b.totalPoints - a.totalPoints)

    top5 = entries.slice(0, 5).map((e, i) => {
      const p = players.find((pl) => pl.id === e.playerId)!
      return { playerId: e.playerId, fullName: p?.fullName ?? '?', photoUrl: p?.photoUrl ?? null, totalPoints: e.totalPoints, position: i + 1 }
    })
  }

  const activityIcons: Record<string, string> = {
    ROUND_SUBMITTED: '🏌️',
    ROUND_APPROVED: '✅',
    ROUND_REJECTED: '❌',
    PLAYER_JOINED: '👋',
    RANKING_UPDATE: '📊',
    ACHIEVEMENT_UNLOCKED: '🏆',
    LONG_DRIVE_LEADER: '💨',
    BEST_APPROACH_LEADER: '🎯',
    SEASON_START: '🏁',
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {activeSeason && (
          <p className="text-gray-500 text-sm mt-1">
            Temporada activa: <span className="font-semibold text-green-700">{activeSeason.name}</span>
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Jugadores activos" value={totalPlayers} icon={<Users size={20} />} />
        <StatCard label="Rondas aprobadas" value={approvedRounds} icon={<CheckCircle size={20} />} />
        <StatCard label="Pendientes" value={pendingRounds} icon={<Clock size={20} />} accent={pendingRounds > 0} />
        <StatCard label="Total rondas" value={approvedRounds + pendingRounds} icon={<Flag size={20} />} />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Ranking top 5 */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Trophy size={18} className="text-yellow-500" />
                Top 5 Ranking
              </h2>
              {activeSeason && <Badge variant="green">{activeSeason.name}</Badge>}
            </div>
            {top5.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Sin datos de temporada</p>
            ) : (
              <div className="space-y-3">
                {top5.map((e) => (
                  <div key={e.playerId} className="flex items-center gap-3">
                    <span className={`w-7 text-center text-sm font-bold ${
                      e.position === 1 ? 'text-yellow-600' :
                      e.position === 2 ? 'text-gray-400' :
                      e.position === 3 ? 'text-orange-400' : 'text-gray-500'
                    }`}>{e.position}°</span>
                    <PlayerAvatar name={e.fullName} photoUrl={e.photoUrl} size="sm" />
                    <span className="flex-1 text-sm font-medium text-gray-900 truncate">{e.fullName}</span>
                    <span className="text-sm font-bold text-green-700">{e.totalPoints} pts</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Rondas recientes */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-green-600" />
                Rondas recientes
              </h2>
              {pendingRounds > 0 && (
                <a href="/admin/rounds" className="text-xs text-green-700 font-medium hover:underline">
                  {pendingRounds} pendiente{pendingRounds !== 1 && 's'} →
                </a>
              )}
            </div>
            {recentRounds.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No hay rondas aún</p>
            ) : (
              <div className="space-y-3">
                {recentRounds.map((r) => (
                  <div key={r.id} className="flex items-center gap-3">
                    <PlayerAvatar name={r.player.fullName} photoUrl={r.player.photoUrl} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{r.player.fullName}</p>
                      <p className="text-xs text-gray-500">{formatDate(r.playedAt)} · {r.clubName ?? 'Sin club'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {r.grossScore && <p className="text-sm font-bold text-gray-900 mb-0.5">{r.grossScore} golpes</p>}
                      <RoundStatusBadge status={r.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Feed */}
          {recentActivity.length > 0 && (
            <Card>
              <h2 className="font-semibold text-gray-900 mb-3">Actividad reciente</h2>
              <div className="space-y-2">
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 text-sm">
                    <span className="text-base mt-0.5 shrink-0">{activityIcons[item.type] ?? '📌'}</span>
                    <p className="text-gray-700 flex-1">{item.message}</p>
                    <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{formatDate(item.createdAt)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

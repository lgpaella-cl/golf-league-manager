import { redirect } from 'next/navigation'
import { Trophy, Medal, Award } from 'lucide-react'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { calculateSeasonRanking } from '@/lib/scoring'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, Thead, Tbody, Th, Td } from '@/components/ui/table'
import { PlayerAvatar } from '@/components/shared/PlayerAvatar'
import { SeasonSelector } from './season-selector'

export const metadata = { title: 'Ranking' }

interface SearchParams { season?: string }

export default async function RankingPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const params = await searchParams
  const orgId = session.organizationId

  const seasons = await prisma.season.findMany({
    where: { organizationId: orgId },
    orderBy: { startDate: 'desc' },
  })

  const activeSeason = seasons.find((s) => s.isActive)
  const selectedSeason = params.season
    ? seasons.find((s) => s.id === params.season)
    : activeSeason

  let ranking: { position: number; player: { id: string; fullName: string; photoUrl: string | null; handicapIndex: number | null }; totalPoints: number; roundsPlayed: number; bestGross: number | null; bestNet: number | null; totalBirdies: number; totalEagles: number }[] = []

  if (selectedSeason) {
    const [rounds, players] = await Promise.all([
      prisma.round.findMany({
        where: { organizationId: orgId, seasonId: selectedSeason.id, status: 'APPROVED' },
        select: { id: true, playerId: true, grossScore: true, netScore: true, points: true, birdies: true, eagles: true, pars: true, playedAt: true, status: true },
      }),
      prisma.player.findMany({
        where: { organizationId: orgId },
        select: { id: true, fullName: true, photoUrl: true, handicapIndex: true },
      }),
    ])

    const config = selectedSeason.pointsConfig as { positions: number[]; participation: number }
    const rankingMap = calculateSeasonRanking(rounds, config, selectedSeason.autoDiscards)
    const playerMap = new Map(players.map((p) => [p.id, p]))

    ranking = Array.from(rankingMap.values())
      .sort((a, b) => b.totalPoints - a.totalPoints || (a.bestGross ?? 999) - (b.bestGross ?? 999))
      .map((e, i) => ({
        position: i + 1,
        player: playerMap.get(e.playerId)!,
        totalPoints: e.totalPoints,
        roundsPlayed: e.roundsPlayed,
        bestGross: e.bestGross,
        bestNet: e.bestNet,
        totalBirdies: e.totalBirdies,
        totalEagles: e.totalEagles,
      }))
      .filter((e) => e.player)
  }

  const top3 = ranking.slice(0, 3)

  function PositionIcon({ pos }: { pos: number }) {
    if (pos === 1) return <Trophy size={16} className="text-yellow-500" />
    if (pos === 2) return <Medal size={16} className="text-gray-400" />
    if (pos === 3) return <Award size={16} className="text-orange-400" />
    return <span className="text-sm text-gray-500 font-mono w-5 text-center">{pos}°</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ranking</h1>
          {selectedSeason && (
            <p className="text-gray-500 text-sm mt-1">
              {selectedSeason.name} · {ranking.length} jugadores
            </p>
          )}
        </div>
        <SeasonSelector seasons={seasons.map((s) => ({ id: s.id, name: s.name, isActive: s.isActive }))} current={selectedSeason?.id} />
      </div>

      {/* Podium top 3 */}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {top3.map((e) => (
            <Card key={e.player.id} className={e.position === 1 ? 'ring-2 ring-yellow-400' : ''}>
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  {e.position === 1 ? <Trophy size={32} className="text-yellow-500" /> :
                   e.position === 2 ? <Medal size={32} className="text-gray-400" /> :
                   <Award size={32} className="text-orange-400" />}
                </div>
                <PlayerAvatar name={e.player.fullName} photoUrl={e.player.photoUrl} size="lg" className="mx-auto mb-2" />
                <p className="font-semibold text-gray-900 text-sm leading-tight">{e.player.fullName}</p>
                <p className="text-2xl font-bold text-green-700 mt-1">{e.totalPoints}</p>
                <p className="text-xs text-gray-400">puntos</p>
                <div className="mt-2 flex justify-center gap-2 text-xs text-gray-500">
                  <span>{e.roundsPlayed} ronda{e.roundsPlayed !== 1 && 's'}</span>
                  {e.bestGross && <span>· Mejor {e.bestGross}</span>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {ranking.length === 0 ? (
        <Card className="text-center py-16">
          <Trophy size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">Sin datos para esta temporada</p>
          <p className="text-xs text-gray-400 mt-1">Aprueba rondas para generar el ranking</p>
        </Card>
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th className="w-12">Pos</Th>
              <Th>Jugador</Th>
              <Th className="text-center">Rondas</Th>
              <Th className="text-center">Puntos</Th>
              <Th className="text-center">Mejor Gross</Th>
              <Th className="text-center">Mejor Neto</Th>
              <Th className="text-center">Birdies</Th>
              <Th className="text-center">Eagles</Th>
              <Th className="text-center">HCP</Th>
            </tr>
          </Thead>
          <Tbody>
            {ranking.map((e) => (
              <tr key={e.player.id} className={`hover:bg-gray-50 transition-colors ${e.position <= 3 ? 'bg-yellow-50/20' : ''}`}>
                <Td>
                  <div className="flex items-center justify-center">
                    <PositionIcon pos={e.position} />
                  </div>
                </Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <PlayerAvatar name={e.player.fullName} photoUrl={e.player.photoUrl} size="sm" />
                    <span className="font-medium text-gray-900">{e.player.fullName}</span>
                  </div>
                </Td>
                <Td className="text-center">{e.roundsPlayed}</Td>
                <Td className="text-center">
                  <span className="font-bold text-green-700 text-base">{e.totalPoints}</span>
                </Td>
                <Td className="text-center font-mono">{e.bestGross ?? '—'}</Td>
                <Td className="text-center font-mono">{e.bestNet ?? '—'}</Td>
                <Td className="text-center text-blue-600 font-medium">{e.totalBirdies || '—'}</Td>
                <Td className="text-center text-purple-600 font-medium">{e.totalEagles || '—'}</Td>
                <Td className="text-center text-gray-500">{e.player.handicapIndex ?? '—'}</Td>
              </tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  )
}

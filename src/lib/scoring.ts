import 'server-only'

export interface RoundForRanking {
  id: string
  playerId: string
  grossScore: number | null
  netScore: number | null
  points: number
  birdies: number
  eagles: number
  pars: number
  playedAt: Date
  status: string
}

export interface PlayerRankingData {
  playerId: string
  totalPoints: number
  monthsPlayed: number
  roundsPlayed: number
  bestGross: number | null
  bestNet: number | null
  totalBirdies: number
  totalEagles: number
  monthlyPoints: Map<string, number>
}

// Calcula el ranking de la temporada dado el conjunto de rondas aprobadas
export function calculateSeasonRanking(
  rounds: RoundForRanking[],
  config: { positions: number[]; participation: number },
  autoDiscards: number,
): Map<string, PlayerRankingData> {
  const approvedRounds = rounds.filter((r) => r.status === 'APPROVED')

  // Agrupar rondas por jugador y mes
  const byPlayerMonth = new Map<string, Map<string, RoundForRanking[]>>()
  for (const round of approvedRounds) {
    const monthKey = `${round.playedAt.getFullYear()}-${String(round.playedAt.getMonth() + 1).padStart(2, '0')}`
    if (!byPlayerMonth.has(round.playerId)) byPlayerMonth.set(round.playerId, new Map())
    const playerMonths = byPlayerMonth.get(round.playerId)!
    if (!playerMonths.has(monthKey)) playerMonths.set(monthKey, [])
    playerMonths.get(monthKey)!.push(round)
  }

  // Ranking mensual: mejor neto del mes por jugador
  const monthlyBestByPlayer = new Map<string, Map<string, { net: number | null; gross: number | null }>>()
  for (const [playerId, months] of byPlayerMonth) {
    monthlyBestByPlayer.set(playerId, new Map())
    for (const [month, monthRounds] of months) {
      const best = monthRounds.reduce((prev, curr) => {
        const prevNet = prev.netScore ?? Infinity
        const currNet = curr.netScore ?? Infinity
        return currNet < prevNet ? curr : prev
      })
      monthlyBestByPlayer.get(playerId)!.set(month, { net: best.netScore, gross: best.grossScore })
    }
  }

  // Calcular posiciones mensuales para asignar puntos
  const allMonths = new Set<string>()
  for (const months of monthlyBestByPlayer.values()) {
    for (const month of months.keys()) allMonths.add(month)
  }

  const monthlyPointsByPlayer = new Map<string, Map<string, number>>()
  for (const month of allMonths) {
    // Ordenar jugadores por mejor neto del mes
    const monthPlayers: { playerId: string; net: number }[] = []
    for (const [playerId, months] of monthlyBestByPlayer) {
      const best = months.get(month)
      if (best?.net != null) monthPlayers.push({ playerId, net: best.net })
    }
    monthPlayers.sort((a, b) => a.net - b.net)

    monthPlayers.forEach(({ playerId }, idx) => {
      if (!monthlyPointsByPlayer.has(playerId)) monthlyPointsByPlayer.set(playerId, new Map())
      const pts = config.positions[idx] ?? config.participation
      monthlyPointsByPlayer.get(playerId)!.set(month, pts)
    })

    // Participación: jugadores que no tuvieron net score pero jugaron
    for (const [playerId, months] of monthlyBestByPlayer) {
      if (months.has(month) && !monthlyPointsByPlayer.get(playerId)?.has(month)) {
        if (!monthlyPointsByPlayer.has(playerId)) monthlyPointsByPlayer.set(playerId, new Map())
        monthlyPointsByPlayer.get(playerId)!.set(month, config.participation)
      }
    }
  }

  // Aplicar descartes y calcular totales finales
  const result = new Map<string, PlayerRankingData>()
  for (const [playerId, monthlyPoints] of monthlyPointsByPlayer) {
    const pointsArr = Array.from(monthlyPoints.values()).sort((a, b) => b - a)
    const kept = autoDiscards > 0 ? pointsArr.slice(0, -autoDiscards) : pointsArr
    const totalPoints = kept.reduce((s, p) => s + p, 0)

    const playerRounds = approvedRounds.filter((r) => r.playerId === playerId)
    const grossScores = playerRounds.map((r) => r.grossScore).filter((s): s is number => s != null)
    const netScores = playerRounds.map((r) => r.netScore).filter((s): s is number => s != null)

    result.set(playerId, {
      playerId,
      totalPoints,
      monthsPlayed: monthlyPoints.size,
      roundsPlayed: playerRounds.length,
      bestGross: grossScores.length > 0 ? Math.min(...grossScores) : null,
      bestNet: netScores.length > 0 ? Math.min(...netScores) : null,
      totalBirdies: playerRounds.reduce((s, r) => s + r.birdies, 0),
      totalEagles: playerRounds.reduce((s, r) => s + r.eagles, 0),
      monthlyPoints,
    })
  }

  return result
}

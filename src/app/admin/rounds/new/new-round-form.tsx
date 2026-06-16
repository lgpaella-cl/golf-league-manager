'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createRound, type RoundState } from '@/app/actions/rounds'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface Player { id: string; fullName: string; handicapIndex: number | null }
interface Season { id: string; name: string; isActive: boolean; pointsConfig: unknown }

interface Props {
  players: Player[]
  seasons: Season[]
  defaultSeasonId?: string
}

const initial: RoundState = { error: null, success: false }

export function NewRoundForm({ players, seasons, defaultSeasonId }: Props) {
  const router = useRouter()
  const [state, action, pending] = useActionState(createRound, initial)
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [autoHcp, setAutoHcp] = useState<number | null>(null)

  useEffect(() => {
    if (state.success) router.push('/admin/rounds')
  }, [state.success, router])

  function handlePlayerChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value
    setSelectedPlayer(id)
    const player = players.find((p) => p.id === id)
    setAutoHcp(player?.handicapIndex ?? null)
  }

  return (
    <form action={action} className="space-y-6">
      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Información básica</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Jugador *</label>
              <select
                name="playerId"
                required
                value={selectedPlayer}
                onChange={handlePlayerChange}
                className="h-9 border border-gray-300 rounded-lg px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-700"
              >
                <option value="">Seleccionar jugador</option>
                {players.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Temporada *</label>
              <select
                name="seasonId"
                required
                defaultValue={defaultSeasonId ?? ''}
                className="h-9 border border-gray-300 rounded-lg px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-700"
              >
                <option value="">Seleccionar temporada</option>
                {seasons.map((s) => <option key={s.id} value={s.id}>{s.name}{s.isActive ? ' (activa)' : ''}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input name="playedAt" type="date" label="Fecha de juego *" defaultValue={new Date().toISOString().split('T')[0]} required />
            <Input name="clubName" label="Club / Campo" placeholder="Club de Golf Maipo" />
          </div>
          <Input name="witnessName" label="Testigo de fe" placeholder="Nombre del testigo" />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Scores</h2>
        <div className="grid grid-cols-3 gap-4">
          <Input name="grossScore" type="number" label="Score Gross" placeholder="85" min="40" max="200" />
          <Input
            name="handicapUsed"
            type="number"
            step="0.1"
            label="Handicap usado"
            placeholder={autoHcp?.toString() ?? '18.0'}
            defaultValue={autoHcp?.toString() ?? ''}
            hint="Se auto-completa del jugador"
          />
          <Input name="netScore" type="number" step="0.1" label="Score Neto" placeholder="Auto: Gross - HCP" hint="Vacío = Gross - HCP" />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <Input name="birdies" type="number" min="0" label="Birdies" defaultValue="0" />
          <Input name="eagles" type="number" min="0" label="Eagles" defaultValue="0" />
          <Input name="pars" type="number" min="0" label="Pars" defaultValue="0" />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Notas opcionales</h2>
        <textarea
          name="notes"
          placeholder="Observaciones sobre la ronda..."
          rows={3}
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-700 resize-none"
        />
      </Card>

      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="flex gap-3">
        <a href="/admin/rounds" className="flex-1 inline-flex items-center justify-center h-9 px-4 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Cancelar
        </a>
        <Button type="submit" className="flex-1" loading={pending}>
          Guardar ronda (pendiente)
        </Button>
      </div>
    </form>
  )
}

'use client'

import { useActionState, useState, useEffect, ReactNode } from 'react'
import { createPlayer, updatePlayer, type PlayerState } from '@/app/actions/players'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Player {
  id: string; fullName: string; email: string | null; phone: string | null
  handicapIndex: number | null; joinedAt: Date
}

interface Props {
  mode: 'create' | 'edit'
  player?: Player
  children: ReactNode
}

const initial: PlayerState = { error: null, success: false }

export function PlayerDialog({ mode, player, children }: Props) {
  const [open, setOpen] = useState(false)

  const boundAction = mode === 'edit' && player
    ? updatePlayer.bind(null, player.id)
    : createPlayer

  const [state, action, pending] = useActionState(boundAction as any, initial)

  useEffect(() => {
    if (state.success) setOpen(false)
  }, [state.success])

  return (
    <>
      <span onClick={() => setOpen(true)} className="cursor-pointer">{children}</span>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">{mode === 'create' ? 'Nuevo jugador' : 'Editar jugador'}</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <form action={action} className="p-6 space-y-4">
              <Input name="fullName" label="Nombre completo" defaultValue={player?.fullName} placeholder="Juan Pérez" required />
              <div className="grid grid-cols-2 gap-4">
                <Input name="email" type="email" label="Email" defaultValue={player?.email ?? ''} placeholder="juan@email.com" />
                <Input name="phone" label="Teléfono" defaultValue={player?.phone ?? ''} placeholder="+56 9 1234 5678" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input name="handicapIndex" type="number" step="0.1" min="0" max="54" label="Handicap" defaultValue={player?.handicapIndex ?? ''} placeholder="18.0" />
                <Input name="joinedAt" type="date" label="Fecha ingreso" defaultValue={player?.joinedAt ? player.joinedAt.toISOString().split('T')[0] : ''} />
              </div>
              {state.error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>}
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1" loading={pending}>{mode === 'create' ? 'Crear jugador' : 'Guardar cambios'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

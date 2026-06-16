'use client'

import { useActionState, useEffect, useState, ReactNode } from 'react'
import { createSeason, type SeasonState } from '@/app/actions/seasons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const initial: SeasonState = { error: null, success: false }

export function SeasonDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(createSeason, initial)

  useEffect(() => {
    if (state.success) setOpen(false)
  }, [state.success])

  return (
    <>
      <span onClick={() => setOpen(true)} className="cursor-pointer">{children}</span>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Nueva temporada</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form action={action} className="p-6 space-y-4">
              <Input name="name" label="Nombre" placeholder="Clausura 2026" required />
              <div className="grid grid-cols-2 gap-4">
                <Input name="startDate" type="date" label="Fecha inicio" required />
                <Input name="endDate" type="date" label="Fecha fin" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input name="maxRoundsPerMonth" type="number" min="1" max="10" label="Rondas máx/mes" defaultValue="2" hint="Por jugador" />
                <Input name="autoDiscards" type="number" min="0" max="5" label="Descartes" defaultValue="1" hint="Peores meses a eliminar" />
              </div>
              {state.error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>}
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1" loading={pending}>Crear temporada</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

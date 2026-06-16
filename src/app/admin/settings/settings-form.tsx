'use client'

import { useActionState } from 'react'
import { updateSettings } from '@/app/actions/seasons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Settings, Save, CheckCircle } from 'lucide-react'

const initial = { error: null, success: false }

interface Props {
  defaultName: string
  defaultMaxRounds: number
  defaultAutoDiscards: number
  defaultValidMonths: number
}

export function SettingsForm({ defaultName, defaultMaxRounds, defaultAutoDiscards, defaultValidMonths }: Props) {
  const [state, action, pending] = useActionState(updateSettings, initial)

  return (
    <form action={action} className="space-y-6">
      <Card>
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings size={18} className="text-green-700" />
          Identidad de la liga
        </h2>
        <Input name="name" label="Nombre de la liga" defaultValue={defaultName} placeholder="Liga de Golf Amateur" required />
      </Card>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Reglas de temporada</h2>
        <div className="grid grid-cols-3 gap-4">
          <Input
            name="maxRoundsPerMonth"
            type="number" min="1" max="10"
            label="Rondas máx. por mes"
            defaultValue={defaultMaxRounds}
            hint="Por jugador"
          />
          <Input
            name="validMonthsCount"
            type="number" min="1" max="12"
            label="Meses que cuentan"
            defaultValue={defaultValidMonths}
          />
          <Input
            name="autoDiscards"
            type="number" min="0" max="5"
            label="Descartes automáticos"
            defaultValue={defaultAutoDiscards}
            hint="Peores meses descartados"
          />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-2">Sistema de puntos</h2>
        <p className="text-sm text-gray-500 mb-4">Configuración del ranking mensual:</p>
        <div className="grid grid-cols-5 gap-2 text-sm">
          {[['1°', 100], ['2°', 90], ['3°', 85], ['4°', 80], ['5°', 76], ['6°', 72], ['7°', 68], ['8°', 64], ['9°', 60], ['10°', 56]].map(([pos, pts]) => (
            <div key={pos} className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-500">{pos}</p>
              <p className="font-bold text-green-700">{pts}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Participación: 40 pts · Próximamente configurable</p>
      </Card>

      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{state.error}</div>
      )}

      <div className="flex items-center gap-4">
        <Button type="submit" size="lg" loading={pending}>
          <Save size={16} />
          Guardar cambios
        </Button>
        {state.success && (
          <span className="flex items-center gap-1.5 text-green-700 text-sm font-medium">
            <CheckCircle size={16} />
            Guardado correctamente
          </span>
        )}
      </div>
    </form>
  )
}

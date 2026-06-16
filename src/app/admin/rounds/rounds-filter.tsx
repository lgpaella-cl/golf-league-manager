'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface Props { seasons: { id: string; name: string }[] }

export function RoundsFilter({ seasons }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    router.push(`${pathname}?${next.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select
        defaultValue={params.get('season') ?? ''}
        onChange={(e) => update('season', e.target.value)}
        className="text-sm border border-gray-300 rounded-lg px-3 h-9 focus:outline-none focus:ring-2 focus:ring-green-700 bg-white"
      >
        <option value="">Todas las temporadas</option>
        {seasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <select
        defaultValue={params.get('status') ?? ''}
        onChange={(e) => update('status', e.target.value)}
        className="text-sm border border-gray-300 rounded-lg px-3 h-9 focus:outline-none focus:ring-2 focus:ring-green-700 bg-white"
      >
        <option value="">Todos los estados</option>
        <option value="PENDING">Pendientes</option>
        <option value="APPROVED">Aprobadas</option>
        <option value="REJECTED">Rechazadas</option>
      </select>
    </div>
  )
}

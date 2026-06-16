'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface Props { seasons: { id: string; name: string; isActive: boolean }[]; current?: string }

export function SeasonSelector({ seasons, current }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  return (
    <select
      value={current ?? ''}
      onChange={(e) => {
        const next = new URLSearchParams(params.toString())
        if (e.target.value) next.set('season', e.target.value)
        else next.delete('season')
        router.push(`${pathname}?${next.toString()}`)
      }}
      className="text-sm border border-gray-300 rounded-lg px-3 h-9 bg-white focus:outline-none focus:ring-2 focus:ring-green-700"
    >
      <option value="">Seleccionar temporada</option>
      {seasons.map((s) => <option key={s.id} value={s.id}>{s.name}{s.isActive ? ' ●' : ''}</option>)}
    </select>
  )
}

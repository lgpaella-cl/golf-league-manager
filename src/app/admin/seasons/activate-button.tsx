'use client'

import { useTransition } from 'react'
import { activateSeason } from '@/app/actions/seasons'

export function ActivateButton({ id }: { id: string }) {
  const [pending, start] = useTransition()
  return (
    <button
      disabled={pending}
      onClick={() => start(() => activateSeason(id))}
      className="text-sm text-green-700 font-medium hover:underline disabled:opacity-50"
    >
      {pending ? 'Activando...' : 'Activar temporada →'}
    </button>
  )
}

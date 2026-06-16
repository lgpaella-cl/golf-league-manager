'use client'

import { useTransition } from 'react'
import { togglePlayerActive } from '@/app/actions/players'

export function ToggleActiveButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition()
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => togglePlayerActive(id, !isActive))}
      className="text-xs text-gray-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      {pending ? '...' : isActive ? 'Desactivar' : 'Activar'}
    </button>
  )
}

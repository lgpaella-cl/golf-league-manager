'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deletePlayer } from '@/app/actions/players'

export function DeletePlayerButton({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!confirm(`¿Eliminar a ${name}?\n\nSe borrarán todas sus rondas y datos. Esta acción no se puede deshacer.`)) return
    setLoading(true)
    await deletePlayer(id)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
      Borrar
    </button>
  )
}

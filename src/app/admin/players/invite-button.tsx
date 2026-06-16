'use client'

import { useState } from 'react'
import { Mail, Check, Loader2 } from 'lucide-react'
import { sendInvitation } from '@/app/actions/invitations'

export function InviteButton({ playerId }: { playerId: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function handleClick() {
    setStatus('loading')
    const result = await sendInvitation(playerId)
    if (result.error) {
      setMsg(result.error)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    } else {
      setStatus('done')
    }
  }

  if (status === 'done') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium">
        <Check size={13} /> Enviada
      </span>
    )
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <button
        onClick={handleClick}
        disabled={status === 'loading'}
        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors disabled:opacity-50"
      >
        {status === 'loading' ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
        {status === 'loading' ? 'Enviando...' : 'Invitar'}
      </button>
      {status === 'error' && <p className="text-xs text-red-500 max-w-[140px] text-right">{msg}</p>}
    </div>
  )
}

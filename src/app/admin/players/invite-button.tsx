'use client'

import { useState } from 'react'
import { Mail, Check, Loader2, RefreshCw } from 'lucide-react'
import { sendInvitation } from '@/app/actions/invitations'

interface Props {
  playerId: string
  alreadyInvited?: boolean
}

export function InviteButton({ playerId, alreadyInvited = false }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [sent, setSent] = useState(alreadyInvited)
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
      setSent(true)
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <button
        onClick={handleClick}
        disabled={status === 'loading'}
        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors disabled:opacity-50"
      >
        {status === 'loading' && <Loader2 size={13} className="animate-spin" />}
        {status === 'done' && <Check size={13} className="text-green-600" />}
        {status === 'idle' && (sent ? <RefreshCw size={13} /> : <Mail size={13} />)}

        {status === 'loading' && 'Enviando...'}
        {status === 'done' && <span className="text-green-600">Enviada</span>}
        {status === 'idle' && (sent ? 'Reenviar' : 'Invitar')}
      </button>
      {status === 'error' && <p className="text-xs text-red-500 max-w-[140px] text-right">{msg}</p>}
    </div>
  )
}

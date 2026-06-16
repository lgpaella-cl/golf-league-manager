'use client'

import { useTransition, useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { approveRound, rejectRound } from '@/app/actions/rounds'

export function ApproveButton({ id }: { id: string }) {
  const [pending, start] = useTransition()
  return (
    <button
      disabled={pending}
      onClick={() => start(() => approveRound(id))}
      title="Aprobar ronda"
      className="p-1.5 text-gray-400 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
    >
      <CheckCircle size={16} />
    </button>
  )
}

export function RejectButton({ id }: { id: string }) {
  const [pending, start] = useTransition()
  const [showing, setShowing] = useState(false)
  const [reason, setReason] = useState('')

  return (
    <>
      <button
        onClick={() => setShowing(true)}
        title="Rechazar ronda"
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        <XCircle size={16} />
      </button>
      {showing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowing(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-semibold text-gray-900">Rechazar ronda</h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Motivo del rechazo (opcional)"
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
              rows={3}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowing(false)} className="flex-1 h-9 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button
                disabled={pending}
                onClick={() => start(async () => { await rejectRound(id, reason); setShowing(false) })}
                className="flex-1 h-9 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {pending ? '...' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

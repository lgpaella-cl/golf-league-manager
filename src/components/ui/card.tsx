import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps { children: ReactNode; className?: string; noPad?: boolean }

export function Card({ children, className, noPad }: CardProps) {
  return (
    <div className={cn('bg-white rounded-2xl border border-gray-200 shadow-sm', !noPad && 'p-6', className)}>
      {children}
    </div>
  )
}

export function StatCard({ label, value, sub, icon, accent = false }: {
  label: string; value: string | number; sub?: string; icon?: ReactNode; accent?: boolean
}) {
  return (
    <div className={cn('rounded-2xl p-5 flex items-center gap-4', accent ? 'bg-green-800 text-white' : 'bg-white border border-gray-200 shadow-sm')}>
      {icon && (
        <div className={cn('p-3 rounded-xl shrink-0', accent ? 'bg-green-700' : 'bg-green-50 text-green-700')}>
          {icon}
        </div>
      )}
      <div>
        <p className={cn('text-xs font-semibold uppercase tracking-wide', accent ? 'text-green-200' : 'text-gray-500')}>{label}</p>
        <p className={cn('text-2xl font-bold mt-0.5', accent ? 'text-white' : 'text-gray-900')}>{value}</p>
        {sub && <p className={cn('text-xs mt-0.5', accent ? 'text-green-300' : 'text-gray-400')}>{sub}</p>}
      </div>
    </div>
  )
}

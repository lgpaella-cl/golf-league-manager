import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-gray-200', className)}>
      <table className="min-w-full divide-y divide-gray-200 text-sm">{children}</table>
    </div>
  )
}
export function Thead({ children }: { children: ReactNode }) {
  return <thead className="bg-gray-50 text-left">{children}</thead>
}
export function Tbody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-gray-100 bg-white">{children}</tbody>
}
export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return <th className={cn('px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide', className)}>{children}</th>
}
export function Td({ children, className, colSpan }: { children?: ReactNode; className?: string; colSpan?: number }) {
  return <td colSpan={colSpan} className={cn('px-4 py-3 text-sm text-gray-700 whitespace-nowrap', className)}>{children}</td>
}

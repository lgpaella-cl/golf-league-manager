import { cn } from '@/lib/utils'

type Variant = 'green' | 'gold' | 'blue' | 'red' | 'gray' | 'orange' | 'purple'

const variants: Record<Variant, string> = {
  green:  'bg-green-100 text-green-800 border-green-200',
  gold:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  blue:   'bg-blue-100 text-blue-800 border-blue-200',
  red:    'bg-red-100 text-red-700 border-red-200',
  gray:   'bg-gray-100 text-gray-600 border-gray-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
}

interface BadgeProps { children: React.ReactNode; variant?: Variant; className?: string }

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', variants[variant], className)}>
      {children}
    </span>
  )
}

export function RoundStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: Variant }> = {
    PENDING:  { label: 'Pendiente', variant: 'gold' },
    APPROVED: { label: 'Aprobada', variant: 'green' },
    REJECTED: { label: 'Rechazada', variant: 'red' },
  }
  const { label, variant } = map[status] ?? { label: status, variant: 'gray' }
  return <Badge variant={variant}>{label}</Badge>
}

export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; variant: Variant }> = {
    SUPERADMIN: { label: 'Superadmin', variant: 'purple' },
    ADMIN:      { label: 'Admin', variant: 'blue' },
    PLAYER:     { label: 'Jugador', variant: 'green' },
    VIEWER:     { label: 'Viewer', variant: 'gray' },
  }
  const { label, variant } = map[role] ?? { label: role, variant: 'gray' }
  return <Badge variant={variant}>{label}</Badge>
}

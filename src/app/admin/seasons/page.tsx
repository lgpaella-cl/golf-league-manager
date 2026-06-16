import { redirect } from 'next/navigation'
import { CheckCircle, Calendar, Plus } from 'lucide-react'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { SeasonDialog } from './season-dialog'
import { ActivateButton } from './activate-button'

export const metadata = { title: 'Temporadas' }

export default async function SeasonsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const seasons = await prisma.season.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { startDate: 'desc' },
    include: { _count: { select: { rounds: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Temporadas</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona las temporadas de la liga</p>
        </div>
        <SeasonDialog>
          <button className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors">
            <Plus size={16} />
            Nueva temporada
          </button>
        </SeasonDialog>
      </div>

      {seasons.length === 0 ? (
        <Card className="text-center py-16">
          <Calendar size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay temporadas creadas</p>
          <p className="text-sm text-gray-400 mt-1">Crea la primera temporada de tu liga</p>
          <div className="mt-4">
            <SeasonDialog>
              <button className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors">
                <Plus size={16} />
                Crear temporada
              </button>
            </SeasonDialog>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {seasons.map((season) => (
            <Card key={season.id} className={season.isActive ? 'ring-2 ring-green-600' : ''}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 leading-tight">{season.name}</h3>
                <Badge variant={season.isActive ? 'green' : 'gray'}>
                  {season.isActive ? '● Activa' : 'Inactiva'}
                </Badge>
              </div>
              <div className="text-sm text-gray-500 space-y-1 mb-4">
                <p>{formatDate(season.startDate)} → {formatDate(season.endDate)}</p>
                <p>Máx. <strong>{season.maxRoundsPerMonth}</strong> rondas/mes · <strong>{season.autoDiscards}</strong> descarte{season.autoDiscards !== 1 && 's'}</p>
                <p><strong>{season._count.rounds}</strong> ronda{season._count.rounds !== 1 && 's'} registradas</p>
              </div>
              {!season.isActive && <ActivateButton id={season.id} />}
              {season.isActive && (
                <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                  <CheckCircle size={15} />
                  Temporada en curso
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

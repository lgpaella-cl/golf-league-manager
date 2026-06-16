import { redirect } from 'next/navigation'
import { Activity } from 'lucide-react'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/card'
import { formatDateTime } from '@/lib/utils'

export const metadata = { title: 'Actividad' }

const icons: Record<string, string> = {
  ROUND_SUBMITTED: '🏌️',
  ROUND_APPROVED:  '✅',
  ROUND_REJECTED:  '❌',
  PLAYER_JOINED:   '👋',
  RANKING_UPDATE:  '📊',
  ACHIEVEMENT_UNLOCKED: '🏆',
  LONG_DRIVE_LEADER:    '💨',
  BEST_APPROACH_LEADER: '🎯',
  SEASON_START:    '🏁',
}

export default async function ActivityPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const feed = await prisma.activityFeed.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feed de actividad</h1>
        <p className="text-gray-500 text-sm mt-1">Últimos eventos de la liga</p>
      </div>

      {feed.length === 0 ? (
        <Card className="text-center py-16">
          <Activity size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">Sin actividad aún</p>
          <p className="text-xs text-gray-400 mt-1">Los eventos aparecen al aprobar rondas y desbloquear logros</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {feed.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-start gap-3 hover:shadow-sm transition-shadow">
              <span className="text-xl mt-0.5 shrink-0">{icons[item.type] ?? '📌'}</span>
              <p className="flex-1 text-sm text-gray-800">{item.message}</p>
              <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 mt-0.5">{formatDateTime(item.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

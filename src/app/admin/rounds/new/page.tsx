import { redirect } from 'next/navigation'
import { ArrowLeft, Flag } from 'lucide-react'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { NewRoundForm } from './new-round-form'

export const metadata = { title: 'Nueva Ronda' }

export default async function NewRoundPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [players, seasons] = await Promise.all([
    prisma.player.findMany({
      where: { organizationId: session.organizationId, isActive: true },
      orderBy: { fullName: 'asc' },
      select: { id: true, fullName: true, handicapIndex: true },
    }),
    prisma.season.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { startDate: 'desc' },
      select: { id: true, name: true, isActive: true, pointsConfig: true },
    }),
  ])

  const activeSeason = seasons.find((s) => s.isActive)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/rounds" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva ronda</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            La ronda quedará pendiente hasta aprobación manual
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <Flag size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-700">
          <strong>Validación requerida:</strong> El administrador debe aprobar cada ronda antes de que cuente en el ranking.
        </p>
      </div>

      <NewRoundForm
        players={players}
        seasons={seasons}
        defaultSeasonId={activeSeason?.id}
      />
    </div>
  )
}

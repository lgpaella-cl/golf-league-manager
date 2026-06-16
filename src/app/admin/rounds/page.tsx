import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, CheckCircle, XCircle, Eye } from 'lucide-react'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { Table, Thead, Tbody, Th, Td } from '@/components/ui/table'
import { RoundStatusBadge } from '@/components/ui/badge'
import { PlayerAvatar } from '@/components/shared/PlayerAvatar'
import { formatDate } from '@/lib/utils'
import { ApproveButton, RejectButton } from './round-actions'
import { RoundsFilter } from './rounds-filter'

export const metadata = { title: 'Rondas' }

interface SearchParams { season?: string; status?: string }

export default async function RoundsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const params = await searchParams
  const orgId = session.organizationId

  const [rounds, seasons] = await Promise.all([
    prisma.round.findMany({
      where: {
        organizationId: orgId,
        ...(params.season ? { seasonId: params.season } : {}),
        ...(params.status ? { status: params.status } : {}),
      },
      include: { player: true, season: true },
      orderBy: { playedAt: 'desc' },
    }),
    prisma.season.findMany({
      where: { organizationId: orgId },
      orderBy: { startDate: 'desc' },
    }),
  ])

  const pending = rounds.filter((r) => r.status === 'PENDING').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rondas</h1>
          {pending > 0 && (
            <p className="text-amber-600 text-sm mt-1 font-medium">
              ⚠ {pending} ronda{pending !== 1 && 's'} pendiente{pending !== 1 && 's'} de aprobación
            </p>
          )}
        </div>
        <Link
          href="/admin/rounds/new"
          className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors"
        >
          <Plus size={16} />
          Nueva ronda
        </Link>
      </div>

      <RoundsFilter seasons={seasons.map((s) => ({ id: s.id, name: s.name }))} />

      <Table>
        <Thead>
          <tr>
            <Th>Jugador</Th>
            <Th>Fecha</Th>
            <Th>Club</Th>
            <Th className="text-center">Gross</Th>
            <Th className="text-center">Neto</Th>
            <Th className="text-center">HCP</Th>
            <Th className="text-center">Pts</Th>
            <Th>Temporada</Th>
            <Th>Estado</Th>
            <Th className="text-right">Acciones</Th>
          </tr>
        </Thead>
        <Tbody>
          {rounds.length === 0 ? (
            <tr><Td colSpan={10} className="text-center text-gray-400 py-12">No hay rondas</Td></tr>
          ) : rounds.map((r) => (
            <tr key={r.id} className={`hover:bg-gray-50 transition-colors ${r.status === 'PENDING' ? 'bg-amber-50/30' : ''}`}>
              <Td>
                <div className="flex items-center gap-3">
                  <PlayerAvatar name={r.player.fullName} photoUrl={r.player.photoUrl} size="sm" />
                  <span className="font-medium text-gray-900">{r.player.fullName}</span>
                </div>
              </Td>
              <Td className="text-gray-500">{formatDate(r.playedAt)}</Td>
              <Td className="text-gray-500 max-w-[120px] truncate">{r.clubName ?? '—'}</Td>
              <Td className="text-center font-mono font-semibold">{r.grossScore ?? '—'}</Td>
              <Td className="text-center font-mono">{r.netScore ?? '—'}</Td>
              <Td className="text-center font-mono text-gray-500">{r.handicapUsed ?? '—'}</Td>
              <Td className="text-center font-bold text-green-700">{r.points}</Td>
              <Td className="text-gray-500 text-xs">{r.season.name}</Td>
              <Td><RoundStatusBadge status={r.status} /></Td>
              <Td>
                <div className="flex items-center gap-1 justify-end">
                  {r.status === 'PENDING' && (
                    <>
                      <ApproveButton id={r.id} />
                      <RejectButton id={r.id} />
                    </>
                  )}
                </div>
              </Td>
            </tr>
          ))}
        </Tbody>
      </Table>
    </div>
  )
}

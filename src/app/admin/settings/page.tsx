import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { updateSettings } from '@/app/actions/seasons'
import { SettingsForm } from './settings-form'

export const metadata = { title: 'Configuración' }

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [org, settings] = await Promise.all([
    prisma.organization.findUnique({ where: { id: session.organizationId } }),
    prisma.organizationSettings.findUnique({ where: { organizationId: session.organizationId } }),
  ])

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 text-sm mt-1">Ajusta los parámetros de tu liga sin tocar código</p>
      </div>
      <SettingsForm
        defaultName={org?.name ?? ''}
        defaultMaxRounds={settings?.maxRoundsPerMonth ?? 2}
        defaultAutoDiscards={settings?.autoDiscards ?? 1}
        defaultValidMonths={settings?.validMonthsCount ?? 6}
      />
    </div>
  )
}

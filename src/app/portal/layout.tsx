import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { PortalSidebar } from '@/components/layout/PortalSidebar'

export async function generateMetadata(): Promise<Metadata> {
  const session = await getSession()
  if (!session) return {}
  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    select: { name: true },
  })
  return {
    title: { default: org?.name ?? 'Golf League', template: `%s · ${org?.name ?? 'Golf League'}` },
  }
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['PLAYER', 'ADMIN', 'SUPERADMIN'].includes(session.role)) redirect('/login')

  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    select: { name: true },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalSidebar
        orgName={org?.name ?? 'Golf League'}
        playerName={session.name}
        email={session.email}
      />
      <main className="lg:ml-64 pt-14 lg:pt-0 p-6">
        {children}
      </main>
    </div>
  )
}

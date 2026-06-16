import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { PortalSidebar } from '@/components/layout/PortalSidebar'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['PLAYER', 'ADMIN', 'SUPERADMIN'].includes(session.role)) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalSidebar
        orgName="Golf League"
        playerName={session.name}
        email={session.email}
      />
      <main className="lg:ml-64 pt-14 lg:pt-0 p-6">
        {children}
      </main>
    </div>
  )
}

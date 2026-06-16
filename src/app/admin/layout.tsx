import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { AdminSidebar } from '@/components/layout/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    select: { name: true },
  })

  return (
    <div className="flex h-full">
      <AdminSidebar
        orgName={org?.name ?? 'Golf Liga'}
        userName={session.name}
        userEmail={session.email}
      />
      {/* Main content: desktop offset for sidebar, mobile has top header */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 overflow-auto">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ListOrdered, Trophy, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { logout } from '@/app/actions/auth'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/portal', label: 'Mi Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/portal/mis-rondas', label: 'Mis Rondas', icon: ListOrdered },
  { href: '/portal/ranking', label: 'Ranking', icon: Trophy },
]

interface Props {
  orgName: string
  playerName: string | null
  email: string
}

export function PortalSidebar({ orgName, playerName, email }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (item: (typeof navItems)[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-green-700/50">
        <p className="text-xs text-green-300 font-medium uppercase tracking-wider">Liga</p>
        <p className="text-white font-bold text-sm mt-0.5 truncate">{orgName}</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-green-700 text-white'
                  : 'text-green-100 hover:bg-green-700/50 hover:text-white'
              )}
            >
              <item.icon size={18} className="shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-green-700/50">
        <div className="mb-3 px-2">
          <p className="text-white text-sm font-medium truncate">{playerName ?? email}</p>
          <p className="text-green-300 text-xs truncate">{email}</p>
          <span className="mt-1 inline-block text-xs bg-green-700/50 text-green-200 rounded px-2 py-0.5">Jugador</span>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-green-200 hover:text-white hover:bg-green-700/50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-green-900 z-40 flex items-center px-4 gap-3">
        <button onClick={() => setOpen(true)} className="text-white p-1">
          <Menu size={22} />
        </button>
        <span className="text-white font-bold text-sm">{orgName}</span>
      </header>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative w-64 bg-green-900 h-full shadow-xl flex flex-col">
            <div className="flex justify-end p-3">
              <button onClick={() => setOpen(false)} className="text-white p-1">
                <X size={20} />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-green-900 shadow-lg z-30">
        <SidebarContent />
      </aside>
    </>
  )
}

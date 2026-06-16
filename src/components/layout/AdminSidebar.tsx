'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Flag, Calendar, Trophy,
  Settings, Activity, LogOut, ChevronRight, Menu, X,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/actions/auth'

const nav = [
  { href: '/admin',          icon: LayoutDashboard, label: 'Dashboard',     exact: true },
  { href: '/admin/players',  icon: Users,           label: 'Jugadores' },
  { href: '/admin/rounds',   icon: Flag,            label: 'Rondas' },
  { href: '/admin/seasons',  icon: Calendar,        label: 'Temporadas' },
  { href: '/admin/ranking',  icon: Trophy,          label: 'Ranking' },
  { href: '/admin/activity', icon: Activity,        label: 'Actividad' },
  { href: '/admin/settings', icon: Settings,        label: 'Configuración' },
]

interface Props { orgName: string; userName: string | null; userEmail: string }

export function AdminSidebar({ orgName, userName, userEmail }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const sidebar = (
    <div className="flex flex-col h-full bg-green-950">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-green-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">⛳</div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{orgName}</p>
            <p className="text-green-400 text-xs">Admin Panel</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="text-green-400 lg:hidden hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, icon: Icon, label, exact }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
              isActive(href, exact)
                ? 'bg-green-700 text-white shadow-sm'
                : 'text-green-300 hover:bg-green-900 hover:text-white',
            )}
          >
            <Icon size={18} className="shrink-0" />
            <span className="flex-1">{label}</span>
            <ChevronRight size={14} className={cn('opacity-0 group-hover:opacity-60 transition-opacity', isActive(href, exact) && 'opacity-60')} />
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-green-900">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {(userName ?? userEmail)[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-medium truncate">{userName ?? 'Admin'}</p>
            <p className="text-green-400 text-xs truncate">{userEmail}</p>
          </div>
        </div>
        <form action={logout}>
          <button type="submit" className="flex items-center gap-2 text-green-400 hover:text-white text-xs transition-colors w-full">
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col fixed inset-y-0 left-0 z-30">
        {sidebar}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative w-64 h-full">{sidebar}</aside>
        </div>
      )}

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-3 bg-green-950 px-4 h-14 border-b border-green-900">
        <button onClick={() => setOpen(true)} className="text-green-300 hover:text-white">
          <Menu size={20} />
        </button>
        <span className="text-white font-semibold text-sm">{orgName}</span>
      </header>
    </>
  )
}

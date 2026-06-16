import { NextResponse, type NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

const PUBLIC_ROUTES = ['/login', '/invite']
const ADMIN_ROUTES = ['/admin']
const PLAYER_ROUTES = ['/portal']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r))
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r))
  const isPlayerRoute = PLAYER_ROUTES.some((r) => pathname.startsWith(r))

  const token = request.cookies.get('golf_session')?.value
  const session = token ? await decrypt(token) : null

  // Rutas públicas: no requieren sesión
  if (isPublicRoute) {
    if (session && pathname.startsWith('/login')) {
      return NextResponse.redirect(
        new URL(session.role === 'PLAYER' ? '/portal' : '/admin', request.url)
      )
    }
    return NextResponse.next()
  }

  // Sin sesión → login
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Ruta admin: solo ADMIN o SUPERADMIN
  if (isAdminRoute && !['ADMIN', 'SUPERADMIN'].includes(session.role)) {
    return NextResponse.redirect(new URL('/portal', request.url))
  }

  // Ruta portal: PLAYER, ADMIN, SUPERADMIN (todos pueden ver)
  if (isPlayerRoute && !['PLAYER', 'ADMIN', 'SUPERADMIN'].includes(session.role)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|api/upload).*)'],
}

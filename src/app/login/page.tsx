'use client'

import { useActionState } from 'react'
import { login, type AuthState } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const initialState: AuthState = { error: null }

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, initialState)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-green-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4 text-3xl">
            ⛳
          </div>
          <h1 className="text-3xl font-bold text-white">Golf League</h1>
          <p className="text-green-300 text-sm mt-1">Panel de Administración</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Inicia sesión</h2>

          <form action={action} className="space-y-4">
            <Input
              name="email"
              label="Email"
              type="email"
              placeholder="admin@tuliga.com"
              autoComplete="email"
              required
            />
            <Input
              name="password"
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />

            {state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {state.error}
              </div>
            )}

            <Button type="submit" className="w-full mt-2" size="lg" loading={pending}>
              Ingresar al panel
            </Button>
          </form>
        </div>

        <p className="text-center text-green-400 text-xs mt-6">
          Golf League Manager — Producto SaaS para ligas de golf
        </p>
      </div>
    </div>
  )
}

'use client'

import { useSession } from 'next-auth/react'
import { Bell, User } from 'lucide-react'

export function Topbar() {
  const { data: session } = useSession()

  return (
    <div className="bg-prime-dark/50 border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">
          Bem-vindo de volta!
        </h1>
        <p className="text-prime-cream/60 text-sm">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Bell className="h-5 w-5 text-prime-cream/70" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right">
            <p className="font-medium text-white text-sm">{session?.user?.name || 'Aluno'}</p>
            <p className="text-prime-cream/60 text-xs">{session?.user?.email}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-prime-red flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}

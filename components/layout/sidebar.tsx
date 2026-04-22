'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, TrendingUp, Target, MessageCircle, Settings, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    label: 'Minhas Aulas',
    href: '/dashboard/aulas',
    icon: BookOpen,
  },
  {
    label: 'Meu Progresso',
    href: '/dashboard/progresso',
    icon: TrendingUp,
  },
  {
    label: 'Metas',
    href: '/dashboard/metas',
    icon: Target,
  },
  {
    label: 'Conversação',
    href: '/dashboard/conversacao',
    icon: MessageCircle,
  },
  {
    label: 'Configurações',
    href: '/dashboard/configuracoes',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-prime-dark to-prime-dark/95 border-r border-white/10 p-6 flex flex-col">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-lg bg-prime-red flex items-center justify-center text-white font-display font-bold">
          P
        </div>
        <span className="font-display font-bold text-lg text-white">Prime</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-prime-red text-white'
                  : 'text-prime-cream/70 hover:bg-white/10'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-prime-cream/70 hover:bg-white/10 transition-colors w-full"
      >
        <LogOut className="h-5 w-5" />
        <span className="font-medium">Sair</span>
      </button>
    </aside>
  )
}

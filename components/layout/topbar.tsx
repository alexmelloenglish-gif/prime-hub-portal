import Image from 'next/image'
import { Bell } from 'lucide-react'

interface TopbarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function Topbar({ user }: TopbarProps) {
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())

  return (
    <div className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-prime-dark/80 px-4 py-3 backdrop-blur md:px-5">
      <div>
        <h1 className="font-display text-lg font-bold leading-tight text-white md:text-xl">Welcome back</h1>
        <p className="text-xs text-prime-cream/60">{formattedDate}</p>
      </div>

      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        <button
          type="button"
          className="rounded-lg p-2 transition-colors hover:bg-white/10"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-prime-cream/70" />
        </button>

        <div className="flex min-w-0 items-center gap-2 border-l border-white/10 pl-2 md:gap-3 md:pl-3">
          <div className="text-right">
            <p className="max-w-[10rem] truncate text-xs font-medium text-white md:text-sm">{user.name || 'Student'}</p>
            <p className="hidden max-w-[12rem] truncate text-[11px] text-prime-cream/60 sm:block">{user.email || 'No email available'}</p>
          </div>
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ? `${user.name} profile photo` : 'User profile photo'}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full border border-white/10 object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-prime-red/20 bg-prime-red/10">
              <img src="/assets/prime-logo-p-v2.png" alt="User" className="h-full w-full object-cover opacity-80" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

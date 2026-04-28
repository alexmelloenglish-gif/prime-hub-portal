import Image from 'next/image'
import { Bell, User } from 'lucide-react'

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
    <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-prime-dark/80 px-4 py-4 backdrop-blur md:px-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-sm text-prime-cream/60">{formattedDate}</p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="rounded-lg p-2 transition-colors hover:bg-white/10"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-prime-cream/70" />
        </button>

        <div className="flex items-center gap-3 border-l border-white/10 pl-4">
          <div className="text-right">
            <p className="text-sm font-medium text-white">{user.name || 'Student'}</p>
            <p className="text-xs text-prime-cream/60">{user.email || 'No email available'}</p>
          </div>
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ? `${user.name} profile photo` : 'User profile photo'}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full border border-white/10 object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-prime-red">
              <User className="h-5 w-5 text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

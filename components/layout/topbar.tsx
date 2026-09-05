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
    <div className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/92 px-4 py-2.5 shadow-[0_8px_24px_rgba(15,48,93,0.04)] backdrop-blur md:px-5">
      <div>
        <h1 className="font-display text-base font-bold leading-tight text-[#0a235c] md:text-lg">Welcome back</h1>
        <p className="text-xs capitalize text-[#6b7f9e]">{formattedDate}</p>
      </div>

      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        <button
          type="button"
          className="rounded-xl border border-transparent p-2 transition-colors hover:border-slate-200 hover:bg-slate-50"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 text-[#587093]" />
        </button>

        <div className="flex min-w-0 items-center gap-2 border-l border-slate-200 pl-3 md:gap-3">
          <div className="hidden text-right sm:block">
            <p className="max-w-[11rem] truncate text-xs font-semibold text-[#0a235c] md:text-sm">{user.name || 'Student'}</p>
            <p className="max-w-[13rem] truncate text-[11px] text-[#7183a0]">{user.email || 'No email available'}</p>
          </div>
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ? `${user.name} profile image` : 'User profile image'}
              width={40}
              height={40}
              className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-[0_4px_14px_rgba(15,48,93,0.16)]"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-blue-100 bg-blue-50">
              <img src="/assets/prime-logo-p-v2.png" alt="User" className="h-full w-full object-cover opacity-90" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import type { ManageLink } from '@/lib/student-data'
import {
  Folder, Video, BookOpen, PenLine, Bot, Calendar, Headphones,
  ExternalLink,
} from 'lucide-react'

const iconMap: Record<string, React.ElementType> = {
  folder: Folder,
  video: Video,
  'book-open': BookOpen,
  pencil: PenLine,
  bot: Bot,
  calendar: Calendar,
  headphones: Headphones,
}

type Props = {
  links: ManageLink[]
}

export function ManageSpace({ links }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-prime-red">
          <ExternalLink className="h-4 w-4 text-white" />
        </div>
        <h2 className="font-display text-lg font-bold text-white">Manage Space</h2>
        <span className="ml-1 text-xs text-prime-cream/40">— Quick Access</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {links.map((link) => {
          const Icon = iconMap[link.icon] ?? Folder
          return (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-center transition-all hover:border-prime-red/50 hover:bg-prime-red/10"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-prime-red/20 transition-colors group-hover:bg-prime-red/40">
                <Icon className="h-5 w-5 text-prime-red" />
              </div>
              <span className="text-xs font-medium text-prime-cream/80 leading-tight group-hover:text-white">
                {link.label}
              </span>
            </a>
          )
        })}
      </div>
    </div>
  )
}

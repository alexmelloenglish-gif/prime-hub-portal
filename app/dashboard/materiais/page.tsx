import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStudentData, rafaelData } from '@/lib/student-data'
import { SectionShell } from '@/components/dashboard/section-shell'
import { ExternalLink } from 'lucide-react'

export default async function MaterialsPage() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email ?? ''
  const student = (await getStudentData(email)) ?? rafaelData

  return (
    <SectionShell
      title="Class Materials"
      description="Quick access to all your learning resources."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {student.links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-5 hover:border-prime-red/40 hover:bg-prime-red/5 transition-all"
          >
            <span className="font-medium text-white text-sm group-hover:text-prime-red transition-colors">
              {link.label}
            </span>
            <ExternalLink className="h-4 w-4 text-prime-cream/30 group-hover:text-prime-red transition-colors" />
          </a>
        ))}
      </div>
    </SectionShell>
  )
}

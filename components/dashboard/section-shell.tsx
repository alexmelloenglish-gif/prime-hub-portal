import type { ReactNode } from 'react'

interface SectionShellProps {
  title: string
  description: string
  children: ReactNode
}

export function SectionShell({ title, description, children }: SectionShellProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-display text-3xl font-bold text-white">{title}</h2>
        <p className="max-w-2xl text-sm text-prime-cream/70">{description}</p>
      </div>
      {children}
    </section>
  )
}

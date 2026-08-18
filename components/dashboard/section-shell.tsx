import type { ReactNode } from 'react'

interface SectionShellProps {
  title: string
  description: string
  children: ReactNode
}

export function SectionShell({ title, description, children }: SectionShellProps) {
  return (
    <section className="space-y-5">
      <div className="space-y-1.5">
        <h2 className="font-display text-2xl font-bold leading-tight text-white">{title}</h2>
        <p className="max-w-2xl text-sm text-prime-cream/70">{description}</p>
      </div>
      {children}
    </section>
  )
}

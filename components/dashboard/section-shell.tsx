import type { ReactNode } from 'react'

interface SectionShellProps {
  title: string
  description: string
  children: ReactNode
}

export function SectionShell({ title, description, children }: SectionShellProps) {
  return (
    <section className="space-y-4 md:space-y-5">
      <div className="space-y-1">
        <h2 className="font-display text-xl font-bold leading-tight tracking-[-0.01em] text-white md:text-[1.35rem]">{title}</h2>
        <p className="max-w-2xl text-xs leading-5 text-prime-cream/65">{description}</p>
      </div>
      {children}
    </section>
  )
}

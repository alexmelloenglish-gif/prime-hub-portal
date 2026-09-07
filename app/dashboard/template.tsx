'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as Element | null
      const link = target?.closest('a[href="#next-action"]')
      if (!link) return

      event.preventDefault()
      const params = new URLSearchParams(window.location.search)
      const studentEmail = params.get('studentEmail')
      const destination = studentEmail
        ? `/dashboard/action?studentEmail=${encodeURIComponent(studentEmail)}`
        : '/dashboard/action'
      router.push(destination)
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [router])

  return children
}

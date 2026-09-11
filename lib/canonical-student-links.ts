import studentCoreRegistry from '@/data/students/student-core-registry.json'
import type { ManageSpaceLink } from '@/lib/student-data'

function normalizeEmail(value?: string | null) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

type RegistryStudent = {
  canonicalEmail?: string
  links?: {
    portfolio?: string | null
  }
}

export function getCanonicalPortfolioHref(studentEmail?: string | null): string | null {
  const target = normalizeEmail(studentEmail)
  if (!target) return null

  const student = (studentCoreRegistry.students as RegistryStudent[]).find(
    (entry) => normalizeEmail(entry.canonicalEmail) === target
  )
  const href = student?.links?.portfolio
  return typeof href === 'string' && href.trim() ? href.trim() : null
}

export function resolveCanonicalManageSpaceLinks(
  studentEmail: string,
  links: ManageSpaceLink[]
): ManageSpaceLink[] {
  const canonicalPortfolioHref = getCanonicalPortfolioHref(studentEmail)
  if (!canonicalPortfolioHref) return links

  let replaced = false
  const resolved = links.map((link) => {
    if (link.id !== 'portfolio') return link
    replaced = true
    return {
      ...link,
      href: canonicalPortfolioHref,
    }
  })

  if (replaced) return resolved

  return [
    {
      id: 'portfolio',
      title: 'My Portfolio',
      href: canonicalPortfolioHref,
      description: 'Open your current canonical longitudinal learning portfolio.',
      icon: 'folder-open',
    },
    ...resolved,
  ]
}

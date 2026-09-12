import registry from '@/data/students/student-core-registry.json'

export type OperatingEligibility = 'prospect' | 'learner'

/**
 * Authority that permits a person to cross the operating learner boundary.
 * `legacy_authorized_registry` is a preservation value for learners already
 * admitted to the canonical authorized registry before this explicit contract
 * existed. It is not a new pedagogical decision.
 */
export type ActivationAuthority = 'teacher_confirmed' | 'legacy_authorized_registry' | null

export type LearnerEligibilityRecord = {
  studentId: string
  canonicalEmail: string
  operatingEligibility: OperatingEligibility
  activationAuthority: ActivationAuthority
}

type RegistryStudent = {
  studentId?: string
  canonicalEmail?: string
  operatingEligibility?: OperatingEligibility
  activationAuthority?: ActivationAuthority
}

const students = registry.students as RegistryStudent[]

export function getLearnerEligibility(email?: string | null): LearnerEligibilityRecord | null {
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
  if (!normalizedEmail) return null

  const student = students.find((entry) => entry.canonicalEmail?.trim().toLowerCase() === normalizedEmail)
  if (!student?.studentId || !student.canonicalEmail || !student.operatingEligibility) return null

  return {
    studentId: student.studentId,
    canonicalEmail: student.canonicalEmail,
    operatingEligibility: student.operatingEligibility,
    activationAuthority: student.activationAuthority ?? null,
  }
}

export function isAuthorizedLearner(email?: string | null): boolean {
  const eligibility = getLearnerEligibility(email)
  return eligibility?.operatingEligibility === 'learner' && eligibility.activationAuthority !== null
}

export function isOperatingProspect(email?: string | null): boolean {
  return getLearnerEligibility(email)?.operatingEligibility === 'prospect'
}

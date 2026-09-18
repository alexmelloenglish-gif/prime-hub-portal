import studentCoreRegistry from '@/data/students/student-core-registry.json'

export type CanonicalLearnerIdentity = {
  studentId: string
  learnerName: string
  profileStatus: string
}

type RegistryStudent = {
  studentId?: unknown
  studentName?: unknown
  profileStatus?: unknown
}

export function resolveCanonicalLearnerIdentity(studentId: string): CanonicalLearnerIdentity | null {
  const target = studentId.trim()
  if (!target) return null

  const students = Array.isArray(studentCoreRegistry.students)
    ? (studentCoreRegistry.students as RegistryStudent[])
    : []

  const match = students.find((student) => String(student.studentId ?? '').trim() === target)
  if (!match) return null

  const learnerName = String(match.studentName ?? '').trim()
  const profileStatus = String(match.profileStatus ?? '').trim()

  if (!learnerName || !profileStatus) return null

  return {
    studentId: target,
    learnerName,
    profileStatus,
  }
}

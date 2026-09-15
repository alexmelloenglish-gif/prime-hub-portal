import eduardaCandidate from '@/data/teacher-intelligence/eduarda-coelho-gabriel-v2-candidate.json'

export type TeacherIntelligenceCandidatePackage = typeof eduardaCandidate

const candidates: TeacherIntelligenceCandidatePackage[] = []

export function listTeacherIntelligenceCandidatePackages() {
  return candidates
}

export function getTeacherIntelligenceCandidateByStudent(input: string) {
  const key = input.trim().toLowerCase()
  return candidates.find((item) =>
    item.studentId.toLowerCase() === key ||
    item.studentEmail.toLowerCase() === key ||
    item.studentName.toLowerCase() === key
  ) ?? null
}

export function hasTeacherIntelligenceCandidate(input: string) {
  return Boolean(getTeacherIntelligenceCandidateByStudent(input))
}

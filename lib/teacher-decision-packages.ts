import gustavoPackage from '@/data/teacher-intelligence/gustavo-drummond-v2.json'
import eduardaPackage from '@/data/teacher-intelligence/eduarda-coelho-gabriel-v2.json'

export type TeacherDecisionPackage = typeof gustavoPackage

const packages: TeacherDecisionPackage[] = [gustavoPackage, eduardaPackage]

export function listTeacherDecisionPackages() {
  return packages
}

export function getTeacherDecisionPackageByStudent(input: string) {
  const key = input.trim().toLowerCase()
  return packages.find((item) =>
    item.studentId.toLowerCase() === key ||
    item.studentEmail.toLowerCase() === key ||
    item.studentName.toLowerCase() === key
  ) ?? null
}

export function hasTeacherDecisionPackage(input: string) {
  return Boolean(getTeacherDecisionPackageByStudent(input))
}

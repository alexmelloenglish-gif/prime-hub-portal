import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStudentData, rafaelData } from '@/lib/student-data'
import { ManageSpace } from '@/components/dashboard/manage-space'
import { ProgressTracker } from '@/components/dashboard/progress-tracker'
import { AttendanceOverview } from '@/components/dashboard/attendance-overview'
import { VocabularyPreview } from '@/components/dashboard/vocabulary-preview'
import { GrammarOverview } from '@/components/dashboard/grammar-overview'
import { TeacherFeedback } from '@/components/dashboard/teacher-feedback'
import { StudentHeader } from '@/components/dashboard/student-header'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email ?? ''

  // Busca dados do Firestore; se retornar null (não cadastrado), o layout já redirecionou
  // Se retornar com previewMode=true, Firebase não está configurado ainda
  const student = (await getStudentData(email)) ?? rafaelData
  const isPreview = student.previewMode === true

  return (
    <div className="space-y-6">
      {/* Banner de preview mode — visível apenas quando Firebase não está configurado */}
      {isPreview && (
        <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/5 px-4 py-3 text-sm text-yellow-300">
          <span className="font-semibold">Preview Mode</span> — Firebase não configurado. Exibindo dados de demonstração do Rafael Copolillo.
        </div>
      )}

      {/* Header personalizado */}
      <StudentHeader info={student.info} attendance={student.attendance} />

      {/* Manage Space — links rápidos */}
      <ManageSpace links={student.links} />

      {/* Grid principal */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna esquerda: Progress Tracker + Grammar */}
        <div className="lg:col-span-2 space-y-6">
          <ProgressTracker skills={student.progressTracker} />
          <GrammarOverview items={student.grammarOverview} />
        </div>

        {/* Coluna direita: Attendance + Teacher Feedback */}
        <div className="space-y-6">
          <AttendanceOverview attendance={student.attendance} classes={student.classes} />
          <TeacherFeedback feedback={student.teacherFeedback} month={student.teacherFeedbackMonth} />
        </div>
      </div>

      {/* Vocabulary Bank */}
      <VocabularyPreview items={student.vocabularyBank} />
    </div>
  )
}

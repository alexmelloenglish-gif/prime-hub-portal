import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStudentData, rafaelData } from '@/lib/student-data'
import { SectionShell } from '@/components/dashboard/section-shell'
import { BookMarked } from 'lucide-react'
import { cn } from '@/lib/utils'

const categoryColors: Record<string, string> = {
  'Travel & Documentation': 'bg-blue-400/10 border-blue-400/20 text-blue-300',
  'Work & Institutions':    'bg-yellow-400/10 border-yellow-400/20 text-yellow-300',
  'Geopolitics':            'bg-red-400/10 border-red-400/20 text-red-300',
  'AI & Business':          'bg-purple-400/10 border-purple-400/20 text-purple-300',
  'Daily Life':             'bg-green-400/10 border-green-400/20 text-green-300',
  'Communication':          'bg-pink-400/10 border-pink-400/20 text-pink-300',
}

export default async function VocabularyPage() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email ?? ''
  const student = (await getStudentData(email)) ?? rafaelData
  const items = student.vocabularyBank

  const categories = Array.from(new Set(items.map((i) => i.category)))

  return (
    <SectionShell
      title="Vocabulary Bank"
      description={`${items.length} words and phrases accumulated across all classes.`}
    >
      {categories.map((cat) => {
        const catItems = items.filter((i) => i.category === cat)
        const colorClass = categoryColors[cat] ?? 'bg-white/10 border-white/20 text-white'
        return (
          <div key={cat} className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <BookMarked className="h-4 w-4 text-prime-red" />
              <h3 className="font-display text-base font-bold text-white">{cat}</h3>
              <span className={cn('rounded-full border px-2 py-0.5 text-xs font-medium', colorClass)}>
                {catItems.length} words
              </span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-prime-cream/40 uppercase tracking-wider">Word / Phrase</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-prime-cream/40 uppercase tracking-wider">Meaning</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-prime-cream/40 uppercase tracking-wider hidden md:table-cell">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {catItems.map((item) => (
                    <tr key={item.word} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-semibold text-white">{item.word}</td>
                      <td className="px-4 py-3 text-prime-cream/70">{item.meaning}</td>
                      <td className="px-4 py-3 text-prime-cream/50 italic hidden md:table-cell">{item.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </SectionShell>
  )
}

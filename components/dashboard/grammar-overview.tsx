import type { GrammarItem } from '@/lib/student-data'
import { Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusStyle: Record<string, string> = {
  'Improving':   'bg-pink-400/10 border-pink-400/30 text-pink-400',
  'Developing':  'bg-orange-400/10 border-orange-400/30 text-orange-400',
  'Active':      'bg-green-400/10 border-green-400/30 text-green-400',
  'Consolidated':'bg-blue-400/10 border-blue-400/30 text-blue-400',
}

type Props = {
  items: GrammarItem[]
}

export function GrammarOverview({ items }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-prime-red">
          <Brain className="h-4 w-4 text-white" />
        </div>
        <h2 className="font-display text-lg font-bold text-white">Grammar Overview</h2>
        <span className="ml-1 text-xs text-prime-cream/40">— Cumulative</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="pb-3 text-left text-xs font-semibold text-prime-cream/40 uppercase tracking-wider">Focus Area</th>
              <th className="pb-3 text-left text-xs font-semibold text-prime-cream/40 uppercase tracking-wider hidden md:table-cell">Description</th>
              <th className="pb-3 text-right text-xs font-semibold text-prime-cream/40 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map((item) => (
              <tr key={item.focusArea} className="group">
                <td className="py-3 pr-4 font-medium text-white text-sm">{item.focusArea}</td>
                <td className="py-3 pr-4 text-xs text-prime-cream/60 hidden md:table-cell">{item.description}</td>
                <td className="py-3 text-right">
                  <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-semibold', statusStyle[item.status] ?? statusStyle['Developing'])}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

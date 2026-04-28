'use client'

import { useState } from 'react'
import type { VocabularyItem } from '@/lib/student-data'
import { BookMarked, ChevronDown } from 'lucide-react'

const INITIAL_SHOW = 6

type Props = {
  items: VocabularyItem[]
}

export function VocabularyPreview({ items }: Props) {
  const [showAll, setShowAll] = useState(false)
  const displayed = showAll ? items : items.slice(0, INITIAL_SHOW)

  // Agrupar por categoria
  const categories = Array.from(new Set(items.map((i) => i.category)))

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-prime-red">
            <BookMarked className="h-4 w-4 text-white" />
          </div>
          <h2 className="font-display text-lg font-bold text-white">Vocabulary Bank</h2>
          <span className="ml-1 text-xs text-prime-cream/40">— {items.length} words</span>
        </div>
        {/* Categorias */}
        <div className="hidden md:flex flex-wrap gap-1">
          {categories.map((cat) => (
            <span key={cat} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-prime-cream/50">
              {cat}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {displayed.map((item) => (
          <div
            key={item.word}
            className="rounded-xl border border-white/10 bg-white/5 p-4 hover:border-prime-red/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="font-semibold text-white text-sm">{item.word}</span>
              <span className="shrink-0 rounded-full bg-prime-red/10 border border-prime-red/20 px-2 py-0.5 text-xs text-prime-red/80">
                {item.category}
              </span>
            </div>
            <p className="text-xs text-prime-cream/60 mb-1">{item.meaning}</p>
            <p className="text-xs text-prime-cream/40 italic">&ldquo;{item.example}&rdquo;</p>
          </div>
        ))}
      </div>

      {items.length > INITIAL_SHOW && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2 text-sm text-prime-cream/60 hover:bg-white/5 transition-colors"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
          {showAll ? 'Show less' : `Show all ${items.length} words`}
        </button>
      )}
    </div>
  )
}

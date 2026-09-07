'use client'

import { useEffect, useMemo, useState } from 'react'
import { LockKeyhole, Loader2 } from 'lucide-react'

type VocabularyItem = {
  id: string
  term: string
  meaning: string
}

type LockedSentence = {
  id: string
  vocabularyKey: string
  term: string
  sentence: string
  lockedAt: string
}

type VocabularyReuseGridProps = {
  studentEmail: string
  items: VocabularyItem[]
  tone?: 'light' | 'dark'
}

function vocabularyKey(term: string) {
  return term.trim().toLocaleLowerCase('en-US')
}

export function VocabularyReuseGrid({
  studentEmail,
  items,
  tone = 'light',
}: VocabularyReuseGridProps) {
  const [sentences, setSentences] = useState<LockedSentence[]>([])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const response = await fetch(
          `/api/student/vocabulary-reuse?studentEmail=${encodeURIComponent(studentEmail)}`,
          { cache: 'no-store' }
        )
        const payload = (await response.json()) as {
          sentences?: LockedSentence[]
          error?: string
        }

        if (!response.ok) {
          throw new Error(payload.error || 'Saved sentences could not be loaded.')
        }

        if (!cancelled) {
          setSentences(payload.sentences ?? [])
          setLoadError(null)
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : 'Saved sentences could not be loaded.'
          )
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [studentEmail])

  const byVocabulary = useMemo(() => {
    const grouped = new Map<string, LockedSentence[]>()
    for (const sentence of sentences) {
      const list = grouped.get(sentence.vocabularyKey) ?? []
      list.push(sentence)
      grouped.set(sentence.vocabularyKey, list)
    }
    return grouped
  }, [sentences])

  async function lockSentence(term: string) {
    const key = vocabularyKey(term)
    const sentence = (drafts[key] ?? '').trim()
    if (!sentence) return

    setSavingKey(key)
    setErrors((current) => ({ ...current, [key]: '' }))

    try {
      const response = await fetch('/api/student/vocabulary-reuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentEmail, term, sentence }),
      })
      const payload = (await response.json()) as {
        sentence?: LockedSentence
        error?: string
      }

      if (!response.ok || !payload.sentence) {
        throw new Error(payload.error || 'Your sentence was not saved.')
      }

      setSentences((current) => {
        if (current.some((item) => item.id === payload.sentence?.id)) return current
        return [...current, payload.sentence as LockedSentence]
      })
      setDrafts((current) => ({ ...current, [key]: '' }))
    } catch (error) {
      setErrors((current) => ({
        ...current,
        [key]: error instanceof Error ? error.message : 'Your sentence was not saved.',
      }))
    } finally {
      setSavingKey(null)
    }
  }

  const isDark = tone === 'dark'
  const cardClass = isDark
    ? 'rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-lg'
    : 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'
  const termClass = isDark ? 'text-white' : 'text-[#0a235c]'
  const secondaryClass = isDark ? 'text-prime-cream/75' : 'text-slate-600'
  const inputClass = isDark
    ? 'border-white/10 bg-black/20 text-white placeholder:text-prime-cream/35 focus:border-sky-300/50'
    : 'border-slate-200 bg-slate-50 text-[#0a235c] placeholder:text-slate-400 focus:border-blue-300'
  const lockedClass = isDark
    ? 'border-emerald-300/15 bg-emerald-300/[0.07] text-prime-cream/85'
    : 'border-emerald-100 bg-emerald-50 text-[#36566e]'

  return (
    <div className="space-y-3">
      {loadError ? (
        <p className={`rounded-xl border px-3 py-2 text-xs ${isDark ? 'border-amber-300/20 bg-amber-300/10 text-amber-100' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
          {loadError}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const key = vocabularyKey(item.term)
          const locked = byVocabulary.get(key) ?? []
          const draft = drafts[key] ?? ''
          const isSaving = savingKey === key

          return (
            <article key={item.id} className={cardClass}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-sky-200/70' : 'text-blue-500'}`}>
                    Reuse now
                  </p>
                  <h5 className={`mt-1 text-xl font-semibold ${termClass}`}>{item.term}</h5>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${isDark ? 'border-white/10 text-prime-cream/55' : 'border-slate-200 text-slate-400'}`}>
                  Your words
                </span>
              </div>

              <p className={`mt-3 text-sm leading-6 ${secondaryClass}`}>{item.meaning}</p>

              {locked.length ? (
                <div className="mt-4 space-y-2">
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-emerald-200/70' : 'text-emerald-700'}`}>
                    Your locked sentences
                  </p>
                  {locked.map((entry) => (
                    <div key={entry.id} className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm leading-6 ${lockedClass}`}>
                      <LockKeyhole className="mt-1 h-3.5 w-3.5 shrink-0" />
                      <span>{entry.sentence}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-4">
                <label htmlFor={`reuse-${item.id}`} className={`text-xs font-semibold ${isDark ? 'text-prime-cream/80' : 'text-[#294a75]'}`}>
                  Write your own sentence
                </label>
                <textarea
                  id={`reuse-${item.id}`}
                  value={draft}
                  maxLength={280}
                  rows={2}
                  onChange={(event) =>
                    setDrafts((current) => ({ ...current, [key]: event.target.value }))
                  }
                  placeholder={`Use “${item.term}” in a sentence you would actually say.`}
                  className={`mt-2 w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none transition ${inputClass}`}
                />
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className={`text-[11px] ${isDark ? 'text-prime-cream/45' : 'text-slate-400'}`}>
                    Once locked, it becomes part of your learning memory.
                  </p>
                  <button
                    type="button"
                    disabled={!draft.trim() || isSaving}
                    onClick={() => lockSentence(item.term)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${isDark ? 'bg-white text-[#0a235c] hover:bg-prime-cream' : 'bg-[#0a235c] text-white hover:bg-[#123a78]'}`}
                  >
                    {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LockKeyhole className="h-3.5 w-3.5" />}
                    Lock my sentence
                  </button>
                </div>
                {errors[key] ? <p className="mt-2 text-xs font-medium text-red-500">{errors[key]}</p> : null}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

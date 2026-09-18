import { BookOpen, CheckCircle2, Compass, MessageSquareQuote } from 'lucide-react'
import type { G6CanonicalDashboardAuthorizedState } from '@/lib/g6-canonical-consumer'

type JsonObject = Record<string, unknown>

function asObject(value: unknown): JsonObject {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonObject)
    : {}
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function statement(value: unknown) {
  const object = asObject(value)
  return text(object.statement) || text(object.text) || text(object.title) || text(value)
}

function array(value: unknown) {
  return Array.isArray(value) ? value : []
}

function stateItems(value: unknown) {
  const object = asObject(value)
  return Object.entries(object)
    .map(([key, item]) => {
      const objectItem = asObject(item)
      const itemValue = text(objectItem.value) || text(item)
      if (!itemValue) return null
      return {
        key,
        label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase()),
        value: itemValue,
      }
    })
    .filter((item): item is { key: string; label: string; value: string } => Boolean(item))
}

export function G6CanonicalDashboardOverview({
  state,
}: {
  state: G6CanonicalDashboardAuthorizedState
}) {
  const currentState = stateItems(state.payload.currentState)
  const priorities = array(state.payload.priorities)
  const signals = array(state.payload.learningSignals)
  const vocabulary = array(state.payload.vocabulary)
  const grammar = array(state.payload.grammarCorrections)
  const teacherInsight = statement(state.payload.teacherInsight)
  const nextAction = statement(state.payload.nextAction)
  const nextVerification = text(state.payload.nextVerification)

  return (
    <div className="dashboard-light space-y-7 pb-4">
      <section className="rounded-[30px] border border-blue-200 bg-gradient-to-br from-blue-100 via-white to-sky-100 p-6 shadow-md">
        <p className="text-sm font-bold text-blue-700">Your PRIME learning dashboard</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0a235c] md:text-4xl">
          What matters now, <span className="text-blue-700">{state.learnerName}.</span>
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700 md:text-base">
          Your current learning view is based on your teacher-validated learning record.
        </p>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">NOW</p>
          <h3 className="mt-1 text-2xl font-bold text-[#0a235c]">Current State</h3>
        </div>
        {currentState.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {currentState.map((item) => (
              <article key={item.key} className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{item.value}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-blue-200 bg-white p-4 text-sm text-slate-600">
            No teacher-validated current-state statement is available yet.
          </p>
        )}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-[24px] border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Compass className="h-5 w-5 text-amber-700" />
            <h3 className="text-xl font-bold text-[#0a235c]">What Matters Now</h3>
          </div>
          <div className="mt-4 space-y-3">
            {priorities.length ? priorities.map((item, index) => (
              <div key={index} className="rounded-2xl border border-amber-200 bg-white p-4">
                <p className="text-sm leading-6 text-slate-700">{statement(item) || ('Priority ' + (index + 1))}</p>
              </div>
            )) : <p className="text-sm text-slate-600">No validated current priority is available yet.</p>}
          </div>
        </article>

        <article className="rounded-[24px] border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-700" />
            <h3 className="text-xl font-bold text-[#0a235c]">Next Step</h3>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            {nextAction || 'No teacher-validated next action is available yet.'}
          </p>
          {nextVerification ? (
            <p className="mt-3 border-t border-emerald-200 pt-3 text-xs leading-5 text-slate-600">
              Next check: {nextVerification}
            </p>
          ) : null}
        </article>
      </section>

      {teacherInsight ? (
        <section className="rounded-[24px] border border-violet-200 bg-violet-50/60 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <MessageSquareQuote className="h-5 w-5 text-violet-700" />
            <h3 className="text-xl font-bold text-[#0a235c]">Teacher Perspective</h3>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-700">{teacherInsight}</p>
        </section>
      ) : null}

      {(signals.length || vocabulary.length || grammar.length) ? (
        <section className="rounded-[28px] border border-slate-300 bg-slate-100/70 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-blue-700" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-700">MEMORY</p>
              <h3 className="text-2xl font-bold text-[#0a235c]">Learning Memory</h3>
            </div>
          </div>

          {signals.length ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {signals.map((item, index) => (
                <article key={index} className="rounded-2xl border border-slate-300 bg-white p-4">
                  <p className="text-sm leading-6 text-slate-700">{statement(item)}</p>
                </article>
              ))}
            </div>
          ) : null}

          {vocabulary.length ? (
            <div className="mt-6">
              <h4 className="text-lg font-bold text-[#0a235c]">Vocabulary</h4>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {vocabulary.map((item, index) => {
                  const entry = asObject(item)
                  const term = text(entry.term)
                  const meaning = text(entry.meaning)
                  return (
                    <article key={index} className="rounded-2xl border border-slate-300 bg-white p-4">
                      <p className="font-bold text-[#0a235c]">{term || ('Vocabulary ' + (index + 1))}</p>
                      {meaning ? <p className="mt-1 text-sm text-slate-700">{meaning}</p> : null}
                    </article>
                  )
                })}
              </div>
            </div>
          ) : null}

          {grammar.length ? (
            <div className="mt-6">
              <h4 className="text-lg font-bold text-[#0a235c]">Grammar to Reuse</h4>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {grammar.map((item, index) => {
                  const entry = asObject(item)
                  const original = text(entry.item)
                  const correction = text(entry.correction)
                  return (
                    <article key={index} className="rounded-2xl border border-slate-300 bg-white p-4">
                      <p className="text-sm text-slate-700">{original || ('Grammar item ' + (index + 1))}</p>
                      {correction ? <p className="mt-2 font-semibold text-[#0a235c]">{correction}</p> : null}
                    </article>
                  )
                })}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}

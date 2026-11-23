import type { LearningDataStatus } from '@/lib/student-data-status'

export function DataAvailabilityNotice({ status }: { status: LearningDataStatus }) {
  if (status.availability === 'current') return null
  const unavailable = status.availability === 'unavailable'
  const mixed = status.availability === 'mixed'
  return (
    <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${unavailable ? 'border-amber-300 bg-amber-50 text-amber-950' : 'border-violet-200 bg-violet-50 text-violet-950'}`}>
      <p className="font-bold">{unavailable ? 'Current learning data is temporarily unavailable.' : mixed ? 'Mixed learning record' : 'Historical learning record'}</p>
      <p className="mt-1 leading-6">
        {unavailable
          ? 'The preserved repository snapshot is shown for continuity. It is not being presented as a current Neon-confirmed update.'
          : mixed
            ? 'Some learning updates are published or verified in Neon. Profile fields without a current projection remain from the preserved historical snapshot; the entire profile is not represented as fully current.'
            : 'This view is based on a preserved repository snapshot because no published Neon projection is available yet.'}
      </p>
      {status.asOf ? <p className="mt-1 text-xs font-semibold opacity-80">Reference date: {status.asOf}</p> : null}
    </div>
  )
}

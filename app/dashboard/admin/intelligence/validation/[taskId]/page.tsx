import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'
import { runG2RuntimeProof } from '@/lib/g2-runtime-proof'
import { runG3RuntimeProof } from '@/lib/g3-runtime-proof'
import { runG4RuntimeProof } from '@/lib/g4-runtime-proof'

export const dynamic = 'force-dynamic'

async function executeG2RuntimeProof(formData: FormData) {
  'use server'

  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  if (!session?.user || (role !== 'admin' && role !== 'teacher')) return

  const taskId = String(formData.get('taskId') || '').trim()
  if (!taskId) return

  const result = await runG2RuntimeProof(taskId)
  const params = new URLSearchParams({
    g2Proof: 'pass',
    recordId: result.canonicalRecordId,
    version: String(result.canonicalVersion),
    hash: result.canonicalHash,
    provenanceId: result.provenanceId,
    canonicalCount: String(result.counts.canonicalRecords),
    provenanceCount: String(result.counts.provenanceRows),
    replay: result.replay.idempotentReplay ? 'pass' : 'fail',
    rollback: result.atomicity.noPartialState ? 'pass' : 'fail',
  })

  redirect(`/dashboard/admin/intelligence/validation/${taskId}?${params.toString()}`)
}

async function executeG3RuntimeProof(formData: FormData) {
  'use server'

  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  if (!session?.user || (role !== 'admin' && role !== 'teacher')) return

  const taskId = String(formData.get('taskId') || '').trim()
  if (!taskId) return

  const result = await runG3RuntimeProof(taskId)
  const params = new URLSearchParams({
    g3Proof: result.status === 'PASS' ? 'pass' : 'fail',
    g3VerificationId: result.verificationId,
    g3RecordId: result.canonicalRecordId,
    g3Version: String(result.canonicalVersion),
    g3Hash: result.canonicalHash,
    g3Mismatches: result.mismatchFields.join(','),
  })

  redirect(`/dashboard/admin/intelligence/validation/${taskId}?${params.toString()}`)
}

async function executeG4RuntimeProof(formData: FormData) {
  'use server'

  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  if (!session?.user || (role !== 'admin' && role !== 'teacher')) return

  const taskId = String(formData.get('taskId') || '').trim()
  if (!taskId) return

  const result = await runG4RuntimeProof(taskId)
  const params = new URLSearchParams({
    g4Proof: result.projectionStatus === 'VERIFIED' ? 'pass' : 'fail',
    g4ProjectionId: result.projectionId,
    g4ProjectionKey: result.projectionKey,
    g4ProjectionHash: result.projectionHash,
    g4RecordId: result.canonicalRecordId,
    g4Version: String(result.canonicalVersion),
    g4Hash: result.canonicalHash,
    g4Status: result.projectionStatus,
    g4Replay: result.idempotentReplay ? 'pass' : 'fail',
    g4ProjectionCount: String(result.proofProjectionCount),
    g4Mismatches: result.mismatchFields.join(','),
  })

  redirect(`/dashboard/admin/intelligence/validation/${taskId}?${params.toString()}`)
}

async function decideValidation(formData: FormData) {
  'use server'

  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  if (!session?.user || (role !== 'admin' && role !== 'teacher')) return

  const taskId = String(formData.get('taskId') || '')
  const decision = String(formData.get('decision') || '')
  if (!taskId || !['approved', 'rejected'].includes(decision)) return

  const prisma = getPrismaClient()
  const task = await prisma.validationTask.findUnique({ where: { id: taskId } })
  if (!task) return

  await prisma.validationTask.update({
    where: { id: taskId },
    data: {
      status: decision,
      decision,
      reviewerId: session.user.id,
      reviewedAt: new Date(),
      reason: String(formData.get('reason') || '').trim() || null,
    },
  })

  if (task.type === 'attendance_reconciliation' && decision === 'approved') {
    await prisma.attendanceRecord.update({
      where: { id: task.entityId },
      data: {
        status: 'attended',
        authorityStatus: 'authoritative',
        reconciledAt: new Date(),
      },
    })
  }

  redirect('/dashboard/admin/intelligence/validation')
}

export default async function ValidationTaskPage({
  params,
  searchParams,
}: {
  params: Promise<{ taskId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  if (!session?.user || (role !== 'admin' && role !== 'teacher')) {
    return <main className="mx-auto max-w-4xl p-6">Validation is restricted to teacher and administrator accounts.</main>
  }

  const { taskId } = await params
  const proofParams = await searchParams
  const prisma = getPrismaClient()
  const task = await prisma.validationTask.findUnique({ where: { id: taskId } })
  if (!task) notFound()

  const existingCanonicalization =
    task.type === 'canonical_learning_record_authority'
      ? await prisma.canonicalizationProvenance.findFirst({
          where: { teacherDecisionId: task.id },
          include: { canonicalRecord: true },
        })
      : null

  const existingG3Verification =
    existingCanonicalization
      ? await prisma.canonicalLearningRecordVerification.findFirst({
          where: { expectedCanonicalRecordId: existingCanonicalization.canonicalRecordId },
          orderBy: { verifiedAt: 'desc' },
        })
      : null

  const existingG4Projection =
    existingG3Verification?.verificationStatus === 'PASS'
      ? await prisma.canonicalLearningRecordProjection.findFirst({
          where: { canonicalRecordId: existingG3Verification.expectedCanonicalRecordId },
          orderBy: { createdAt: 'desc' },
        })
      : null

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <Link href="/dashboard/admin/intelligence/validation" className="text-sm font-semibold text-indigo-700 hover:underline">
        ← Back to Validation
      </Link>

      <header>
        <div className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{task.type}</div>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">{task.title}</h1>
        <p className="mt-2 text-slate-600">{task.description}</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-slate-950">Evidence supplied to the validator</h2>
        <pre className="mt-4 max-h-96 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-5 text-slate-100">
          {JSON.stringify(task.evidence, null, 2)}
        </pre>
      </section>

      {task.type === 'canonical_learning_record_authority' ? (
        <section className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Exact authority payload</div>
          <h2 className="mt-1 font-bold text-slate-950">This is the content this decision will authorize</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Approval applies only to this preserved suggestedValue. It does not create a Canonical Learning Record, publish a projection, or change the learner dashboard by itself.
          </p>
          <pre className="mt-4 max-h-[32rem] overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-5 text-slate-100">
            {JSON.stringify(task.suggestedValue, null, 2)}
          </pre>
        </section>
      ) : null}

      {existingG3Verification && existingG3Verification.verificationStatus === 'PASS' && !proofParams.g3Proof ? (
        <section className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">G3 closed witness</div>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Canonical read-back already verified</h2>
          <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <div><dt className="font-semibold">Verification</dt><dd className="break-all">{existingG3Verification.id}</dd></div>
            <div><dt className="font-semibold">Status</dt><dd>{existingG3Verification.verificationStatus}</dd></div>
            <div><dt className="font-semibold">Canonical record</dt><dd className="break-all">{existingG3Verification.expectedCanonicalRecordId}</dd></div>
            <div><dt className="font-semibold">Version</dt><dd>{existingG3Verification.expectedCanonicalVersion}</dd></div>
          </dl>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            The durable G3 PASS witness already exists. The proof is not rerun automatically; G3 remains isolated from downstream projections.
          </p>
        </section>
      ) : null}

      {proofParams.g3Proof ? (
        <section className={proofParams.g3Proof === 'pass' ? 'rounded-2xl border border-emerald-300 bg-emerald-50 p-6 shadow-sm' : 'rounded-2xl border border-rose-300 bg-rose-50 p-6 shadow-sm'}>
          <div className="text-xs font-semibold uppercase tracking-wide">G3 runtime proof</div>
          <h2 className="mt-1 text-xl font-bold text-slate-950">
            {proofParams.g3Proof === 'pass' ? 'PASS — canonical read-back verified' : 'FAIL — canonical read-back mismatch'}
          </h2>
          <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <div><dt className="font-semibold">Canonical record</dt><dd className="break-all">{String(proofParams.g3RecordId || '')}</dd></div>
            <div><dt className="font-semibold">Version</dt><dd>{String(proofParams.g3Version || '')}</dd></div>
            <div><dt className="font-semibold">Canonical hash</dt><dd className="break-all">{String(proofParams.g3Hash || '')}</dd></div>
            <div><dt className="font-semibold">Verification</dt><dd className="break-all">{String(proofParams.g3VerificationId || '')}</dd></div>
            <div><dt className="font-semibold">Mismatches</dt><dd>{String(proofParams.g3Mismatches || 'none')}</dd></div>
          </dl>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            G3 proves read-back only. No canonicalization replay and no Class Report, Learning Intelligence, Dashboard, or Portfolio projection is executed by this proof.
          </p>
        </section>
      ) : null}
      {proofParams.g4Proof ? (
        <section className={proofParams.g4Proof === 'pass' ? 'rounded-2xl border border-emerald-300 bg-emerald-50 p-6 shadow-sm' : 'rounded-2xl border border-rose-300 bg-rose-50 p-6 shadow-sm'}>
          <div className="text-xs font-semibold uppercase tracking-wide">G4 runtime proof</div>
          <h2 className="mt-1 text-xl font-bold text-slate-950">
            {proofParams.g4Proof === 'pass' ? 'PASS — independent projection verified' : 'FAIL — independent projection mismatch'}
          </h2>
          <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <div><dt className="font-semibold">Projection</dt><dd className="break-all">{String(proofParams.g4ProjectionId || '')}</dd></div>
            <div><dt className="font-semibold">Projection key</dt><dd className="break-all">{String(proofParams.g4ProjectionKey || '')}</dd></div>
            <div><dt className="font-semibold">Projection hash</dt><dd className="break-all">{String(proofParams.g4ProjectionHash || '')}</dd></div>
            <div><dt className="font-semibold">Canonical record</dt><dd className="break-all">{String(proofParams.g4RecordId || '')}</dd></div>
            <div><dt className="font-semibold">Canonical version</dt><dd>{String(proofParams.g4Version || '')}</dd></div>
            <div><dt className="font-semibold">Canonical hash</dt><dd className="break-all">{String(proofParams.g4Hash || '')}</dd></div>
            <div><dt className="font-semibold">Projection status</dt><dd>{String(proofParams.g4Status || '')}</dd></div>
            <div><dt className="font-semibold">Replay</dt><dd>{proofParams.g4Replay === 'pass' ? 'PASS — same projection ID/key/hash' : 'FAIL'}</dd></div>
            <div><dt className="font-semibold">Projection count</dt><dd>{String(proofParams.g4ProjectionCount || '')}</dd></div>
            <div><dt className="font-semibold">Mismatches</dt><dd>{String(proofParams.g4Mismatches || 'none')}</dd></div>
          </dl>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            G4 uses the Canonical Learning Record directly. It is additive and does not overwrite legacy PortfolioProjection, ClassReportProjection, Learning Intelligence, dashboard snapshots, or repository/Firestore projections.
          </p>
        </section>
      ) : null}


      {existingG4Projection && existingG4Projection.projectionStatus === 'VERIFIED' && !proofParams.g4Proof ? (
        <section className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">G4 closed witness</div>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Independent portfolio projection already verified</h2>
          <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <div><dt className="font-semibold">Projection</dt><dd className="break-all">{existingG4Projection.projectionId}</dd></div>
            <div><dt className="font-semibold">Status</dt><dd>{existingG4Projection.projectionStatus}</dd></div>
            <div><dt className="font-semibold">Canonical record</dt><dd className="break-all">{existingG4Projection.canonicalRecordId}</dd></div>
            <div><dt className="font-semibold">Canonical version</dt><dd>{existingG4Projection.canonicalVersion}</dd></div>
          </dl>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            The durable G4 projection witness already exists. It is additive and does not replace any legacy learner-facing surface.
          </p>
        </section>
      ) : null}

      {proofParams.g2Proof === 'pass' ? (
        <section className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">G2 runtime proof</div>
          <h2 className="mt-1 text-xl font-bold text-slate-950">PASS — atomic canonicalization + idempotency</h2>
          <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <div><dt className="font-semibold">Canonical record</dt><dd className="break-all">{String(proofParams.recordId || '')}</dd></div>
            <div><dt className="font-semibold">Version</dt><dd>{String(proofParams.version || '')}</dd></div>
            <div><dt className="font-semibold">Canonical hash</dt><dd className="break-all">{String(proofParams.hash || '')}</dd></div>
            <div><dt className="font-semibold">Provenance</dt><dd className="break-all">{String(proofParams.provenanceId || '')}</dd></div>
            <div><dt className="font-semibold">Counts</dt><dd>{String(proofParams.canonicalCount || '')} canonical / {String(proofParams.provenanceCount || '')} provenance</dd></div>
            <div><dt className="font-semibold">Replay</dt><dd>{proofParams.replay === 'pass' ? 'PASS — same record/version/hash' : 'FAIL'}</dd></div>
            <div><dt className="font-semibold">Controlled rollback</dt><dd>{proofParams.rollback === 'pass' ? 'PASS — no partial state' : 'FAIL'}</dd></div>
          </dl>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            This proves G2 only. No learner projection, Learning Intelligence projection, dashboard publication, or G3 canonical read-back verification was executed.
          </p>
        </section>
      ) : null}

      {existingCanonicalization && proofParams.g2Proof !== 'pass' ? (
        <section className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">G2 closed</div>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Canonicalization already materialized</h2>
          <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <div><dt className="font-semibold">Canonical record</dt><dd className="break-all">{existingCanonicalization.canonicalRecordId}</dd></div>
            <div><dt className="font-semibold">Version</dt><dd>{existingCanonicalization.canonicalVersion}</dd></div>
            <div><dt className="font-semibold">Canonical hash</dt><dd className="break-all">{existingCanonicalization.canonicalHash}</dd></div>
            <div><dt className="font-semibold">Provenance</dt><dd className="break-all">{existingCanonicalization.id}</dd></div>
          </dl>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            This authority decision has already produced its canonical record. The G2 experiment must not be rerun from this page. G3 is now a separate read-back verification gate.
          </p>
        </section>
      ) : null}

      {task.status === 'pending' ? (
        <form action={decideValidation} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <input type="hidden" name="taskId" value={task.id} />
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Decision note</span>
            <textarea name="reason" rows={4} className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm" placeholder="Record why this operational fact is accepted or rejected." />
          </label>
          <div className="flex flex-wrap gap-3">
            <button name="decision" value="approved" className="rounded-xl bg-[#263c86] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1e2f6b]">
              {task.type === 'canonical_learning_record_authority' ? 'Approve canonical authority' : 'Approve as proven'}
            </button>
            <button name="decision" value="rejected" className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Reject
            </button>
          </div>
        </form>
      ) : (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="font-semibold text-slate-950">Decision: {task.status}</p>
            {task.reason ? <p className="mt-2 text-sm text-slate-600">{task.reason}</p> : null}
          </section>

          {task.type === 'canonical_learning_record_authority' &&
          task.status === 'approved' &&
          !existingCanonicalization &&
          proofParams.g2Proof !== 'pass' ? (
            <form action={executeG2RuntimeProof} className="rounded-2xl border border-amber-300 bg-amber-50 p-6 shadow-sm">
              <input type="hidden" name="taskId" value={task.id} />
              <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">G2 controlled experiment</div>
              <h2 className="mt-1 text-xl font-bold text-slate-950">Atomic canonicalization + idempotency proof</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This will create the single authorized canonical record for this approved payload, replay the same command to prove idempotency, verify counts remain 1/1, and force a rollback inside a separate transaction to prove no partial canonical state survives. It will not run G3 or any downstream projection.
              </p>
              <button
                type="submit"
                className="mt-4 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
              >
                Run G2 runtime proof
              </button>
            </form>
          ) : null}

          {task.type === 'canonical_learning_record_authority' &&
          task.status === 'approved' &&
          existingCanonicalization &&
          existingG3Verification?.verificationStatus !== 'PASS' &&
          proofParams.g3Proof !== 'pass' ? (
            <form action={executeG3RuntimeProof} className="rounded-2xl border border-indigo-300 bg-indigo-50 p-6 shadow-sm">
              <input type="hidden" name="taskId" value={task.id} />
              <div className="text-xs font-semibold uppercase tracking-wide text-indigo-700">G3 read-back verification</div>
              <h2 className="mt-1 text-xl font-bold text-slate-950">Canonical persistence identity proof</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This proof reads the existing Canonical Learning Record from Neon, compares its record ID, version, hash, teacher decision, source references and pedagogical payload against the preserved G2 write result and authority payload, and persists PASS or FAIL. It does not canonicalize, replay G2, or invoke any downstream projection.
              </p>
              <button type="submit" className="mt-4 rounded-xl bg-[#263c86] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1e2f6b]">
                Run G3 read-back verification
              </button>
            </form>
          ) : null}
          {task.type === 'canonical_learning_record_authority' &&
          task.status === 'approved' &&
          existingG3Verification?.verificationStatus === 'PASS' &&
          existingG4Projection?.projectionStatus !== 'VERIFIED' &&
          proofParams.g4Proof !== 'pass' ? (
            <form action={executeG4RuntimeProof} className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 shadow-sm">
              <input type="hidden" name="taskId" value={task.id} />
              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">G4 first independent projection</div>
              <h2 className="mt-1 text-xl font-bold text-slate-950">Direct Canonical Learning Record → Portfolio projection</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This proof reads the already-verified Canonical Learning Record, creates one additive Canonical Portfolio Projection, replays the exact same command to prove idempotency and a persisted count of one, reads the projection back, and persists VERIFIED or FAILED. It does not write the legacy PortfolioProjection, ClassReportProjection, Learning Intelligence, dashboard snapshots, Firestore, or repository snapshots.
              </p>
              <button type="submit" className="mt-4 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
                Run G4 independent portfolio projection
              </button>
            </form>
          ) : null}
        </>
      )}
    </main>
  )
}

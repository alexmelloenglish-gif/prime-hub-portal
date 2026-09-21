'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Mic,
  Play,
  RotateCcw,
  Square,
  Upload,
} from 'lucide-react'

type Props = {
  title: string
  description: string
  vocabulary: string[]
  studentEmail: string
  actionId?: string
  materialUrl?: string
  bookingUrl?: string
}

const ITALO_ACTION_ID = 'action-professional-introduction-60s'
const CLAUDIO_ACTION_ID = 'next-diving-destination-project'

function missionConfig(actionId?: string) {
  if (actionId === CLAUDIO_ACTION_ID) {
    return {
      eyebrow: 'Decision mission',
      steps: [
        ['01', 'Compare', 'Choose three scuba-diving destinations and compare their conditions, depth, visibility and marine life.'],
        ['02', 'Evaluate', 'Consider safety, cost, logistics, equipment and difficulty. Explain the trade-offs, not only the advantages.'],
        ['03', 'Decide', 'Choose the destination you would recommend and make your decision explicit.'],
        ['04', 'Defend', 'Support your choice with precise reasons and clear connectors such as however, whereas, therefore and overall.'],
      ],
      vocabularyLabel: 'Use precise diving and decision vocabulary',
      recordingLabel: '3–5 minute decision response',
      recordingHint: 'Speak as if you were advising an experienced diver. Record, listen, improve the structure if needed, then submit your best take.',
      successTitle: 'Your diving decision has been submitted.',
      nextTitle: 'Continue the conversation in your next VIP class.',
      nextCopy: 'Your teacher will review this response before the next class. Use the booking page when you are ready to continue.',
    }
  }

  return {
    eyebrow: 'Your next mission',
    steps: [
      ['01', 'Present', 'Who you are and the maritime professional you are becoming.'],
      ['02', 'Prepare', 'Your maritime training and the experience most relevant to the role.'],
      ['03', 'Prove', 'One real example that demonstrates competence, judgment or responsibility.'],
      ['04', 'Purpose', 'The opportunity you are seeking and why you are ready for the next step.'],
    ],
    vocabularyLabel: 'Reuse at least two',
    recordingLabel: '60–90 second recording',
    recordingHint: 'Record, listen, try again if needed, then submit your best take.',
    successTitle: 'Mission received.',
    nextTitle: 'Continue your interview preparation.',
    nextCopy: 'Your teacher will review this response before the next class. Use the booking page when you are ready to continue.',
  }
}

export function ActionWorkspace({
  title,
  description,
  vocabulary,
  studentEmail,
  actionId,
  materialUrl,
  bookingUrl,
}: Props) {
  const config = missionConfig(actionId)
  const [isRecording, setIsRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (!isRecording) return
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [isRecording])

  useEffect(() => {
    if (!actionId) return
    const query = new URLSearchParams({ studentEmail, actionId })
    fetch(`/api/dashboard/action/audio?${query.toString()}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.submission) setSubmitted(true)
      })
      .catch(() => {})
  }, [actionId, studentEmail])

  useEffect(
    () => () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      streamRef.current?.getTracks().forEach((track) => track.stop())
    },
    [audioUrl]
  )

  async function startRecording() {
    setError(null)

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Audio recording is not supported in this browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      let recorder: MediaRecorder

      try {
        recorder = new MediaRecorder(stream, { audioBitsPerSecond: 48000 })
      } catch {
        recorder = new MediaRecorder(stream)
      }

      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        if (audioUrl) URL.revokeObjectURL(audioUrl)
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      recorderRef.current = recorder
      setSeconds(0)
      setAudioBlob(null)
      setAudioUrl(null)
      recorder.start()
      setIsRecording(true)
    } catch {
      setError('Microphone access is required to record your mission.')
    }
  }

  function stopRecording() {
    recorderRef.current?.stop()
    recorderRef.current = null
    setIsRecording(false)
  }

  function reset() {
    if (isRecording) stopRecording()
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioBlob(null)
    setAudioUrl(null)
    setSeconds(0)
    setError(null)
  }

  async function submit() {
    if (!audioBlob || !actionId) return

    setSubmitting(true)
    setError(null)

    const form = new FormData()
    form.append('studentEmail', studentEmail)
    form.append('actionId', actionId)
    form.append('durationSeconds', String(seconds))
    form.append('audio', audioBlob, 'mission-response.webm')

    try {
      const response = await fetch('/api/dashboard/action/audio', {
        method: 'POST',
        body: form,
      })
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Submission failed')
      }
      setSubmitted(true)
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Submission failed. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="space-y-5">
        <article className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-7 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Submit successful
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[#0a235c]">{config.successTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
            Your recording is saved for teacher review. It does not change your learning record until your teacher reviews it.
          </p>
        </article>

        <article className="rounded-[28px] border border-blue-200 bg-blue-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0057b8]">
            Next step
          </p>
          <h3 className="mt-2 text-xl font-semibold text-[#0a235c]">{config.nextTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{config.nextCopy}</p>
          {bookingUrl ? (
            <a
              href={bookingUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0a235c]"
            >
              Book your next class <ArrowRight className="h-4 w-4" />
            </a>
          ) : null}
        </article>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <article className="rounded-[28px] border border-slate-200 bg-white p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          {config.eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#0a235c]">{title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{description}</p>
        {materialUrl && actionId === ITALO_ACTION_ID ? (
          <a
            href={materialUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0057b8]"
          >
            Review Maritime Interview Mission <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
      </article>

      <div className="grid gap-4 lg:grid-cols-2">
        {config.steps.map(([number, heading, copy]) => (
          <article key={number} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold text-[#0057b8]">{number}</p>
            <h3 className="mt-2 font-semibold text-[#0a235c]">{heading}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
          </article>
        ))}
      </div>

      {vocabulary.length ? (
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
            {config.vocabularyLabel}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {vocabulary.slice(0, 6).map((term) => (
              <span
                key={term}
                className="rounded-full border border-amber-300 px-3 py-1.5 text-sm text-slate-700"
              >
                {term}
              </span>
            ))}
          </div>
        </article>
      ) : null}

      <article className="rounded-[28px] border border-blue-200 bg-blue-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0057b8]">
          {config.recordingLabel}
        </p>
        <p className="mt-2 text-3xl font-semibold text-[#0a235c]">{seconds}s</p>
        <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500">
          {config.recordingHint}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0a235c]"
            >
              <Mic className="h-4 w-4" /> Record
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0a235c]"
            >
              <Square className="h-4 w-4" /> Stop
            </button>
          )}
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-[#0a235c]"
          >
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
        </div>

        {audioUrl ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0a235c]">
              <Play className="h-4 w-4" /> Listen to your take
            </div>
            <audio controls src={audioUrl} className="w-full" />
            <button
              type="button"
              disabled={submitting}
              onClick={submit}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-950 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {submitting ? 'Submitting…' : 'Submit to my teacher'}
            </button>
          </div>
        ) : null}

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

        <p className="mt-4 text-xs leading-5 text-slate-500">
          After Submit, the recording is stored securely as a learner submission for teacher review. It is not automatically treated as teacher-confirmed learning evidence.
        </p>
      </article>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { Mic, Play, RotateCcw, Square } from 'lucide-react'

type ActionWorkspaceProps = {
  title: string
  description: string
  vocabulary: string[]
}

export function ActionWorkspace({ title, description, vocabulary }: ActionWorkspaceProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (!isRecording) return
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [isRecording])

  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }, [audioUrl])

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) return
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream
    const recorder = new MediaRecorder(stream)
    chunksRef.current = []
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunksRef.current.push(event.data)
    }
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      setAudioUrl(URL.createObjectURL(blob))
      stream.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    recorderRef.current = recorder
    setSeconds(0)
    setAudioUrl(null)
    recorder.start()
    setIsRecording(true)
  }

  function stopRecording() {
    recorderRef.current?.stop()
    recorderRef.current = null
    setIsRecording(false)
  }

  function reset() {
    if (isRecording) stopRecording()
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setSeconds(0)
  }

  return (
    <div className="space-y-5">
      <article className="rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.22)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-prime-cream/55">Speaking action</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-prime-cream/80">{description}</p>
      </article>

      <div className="grid gap-4 lg:grid-cols-2">
        {[
          ['01', 'Who you are', 'Name, current maritime training and the kind of professional you are becoming.'],
          ['02', 'Your maritime training', 'Mention the course, technical area or training most relevant to the opportunity.'],
          ['03', 'Relevant experience', 'Choose one onboard, technical or practical experience that proves professional readiness.'],
          ['04', 'What you are seeking', 'Close with the type of role, vessel, company or opportunity you want.'],
        ].map(([number, heading, copy]) => (
          <article key={number} className="rounded-2xl border border-white/10 bg-black/15 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">{number}</p>
            <h3 className="mt-2 font-semibold text-white">{heading}</h3>
            <p className="mt-2 text-sm leading-6 text-prime-cream/72">{copy}</p>
          </article>
        ))}
      </div>

      {vocabulary.length ? (
        <article className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Reuse at least two</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {vocabulary.slice(0, 5).map((term) => (
              <span key={term} className="rounded-full border border-amber-200/20 bg-black/15 px-3 py-1.5 text-sm text-prime-cream/85">{term}</span>
            ))}
          </div>
        </article>
      ) : null}

      <article className="rounded-[28px] border border-sky-300/20 bg-sky-300/5 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">60-second practice</p>
            <p className="mt-2 text-3xl font-semibold text-white">{seconds}s</p>
            <p className="mt-2 text-xs text-prime-cream/55">Aim for roughly 60 seconds. Record, listen, then try again.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isRecording ? (
              <button type="button" onClick={startRecording} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0a235c]">
                <Mic className="h-4 w-4" /> Record
              </button>
            ) : (
              <button type="button" onClick={stopRecording} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0a235c]">
                <Square className="h-4 w-4" /> Stop
              </button>
            )}
            <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white">
              <RotateCcw className="h-4 w-4" /> Try again
            </button>
          </div>
        </div>
        {audioUrl ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/15 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><Play className="h-4 w-4" /> Listen to your take</div>
            <audio controls src={audioUrl} className="w-full" />
          </div>
        ) : null}
        <p className="mt-4 text-xs leading-5 text-prime-cream/50">This first pilot version records for immediate practice and replay in the current browser session; it does not yet store the audio as permanent portfolio evidence.</p>
      </article>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowRight, CheckCircle2, ExternalLink, Mic, Play, RotateCcw, Square, Upload } from 'lucide-react'

type Props = { title:string; description:string; vocabulary:string[]; studentEmail:string; actionId?:string; materialUrl?:string; nextMissionUrl?:string }

export function ActionWorkspace({ title, description, vocabulary, studentEmail, actionId, materialUrl, nextMissionUrl }: Props) {
  const [isRecording,setIsRecording]=useState(false)
  const [seconds,setSeconds]=useState(0)
  const [audioUrl,setAudioUrl]=useState<string|null>(null)
  const [audioBlob,setAudioBlob]=useState<Blob|null>(null)
  const [submitting,setSubmitting]=useState(false)
  const [submitted,setSubmitted]=useState(false)
  const [error,setError]=useState<string|null>(null)
  const recorderRef=useRef<MediaRecorder|null>(null)
  const streamRef=useRef<MediaStream|null>(null)
  const chunksRef=useRef<Blob[]>([])

  useEffect(()=>{ if(!isRecording)return; const t=window.setInterval(()=>setSeconds(v=>v+1),1000); return()=>window.clearInterval(t)},[isRecording])
  useEffect(()=>{ if(!actionId)return; fetch(`/api/dashboard/action/audio?studentEmail=${encodeURIComponent(studentEmail)}`).then(r=>r.ok?r.json():null).then(d=>{if(d?.submission)setSubmitted(true)}).catch(()=>{}) },[actionId,studentEmail])
  useEffect(()=>()=>{if(audioUrl)URL.revokeObjectURL(audioUrl);streamRef.current?.getTracks().forEach(t=>t.stop())},[audioUrl])

  async function startRecording(){
    setError(null)
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true}); streamRef.current=stream
      const recorder=new MediaRecorder(stream); chunksRef.current=[]
      recorder.ondataavailable=e=>{if(e.data.size)chunksRef.current.push(e.data)}
      recorder.onstop=()=>{const blob=new Blob(chunksRef.current,{type:recorder.mimeType||'audio/webm'});if(audioUrl)URL.revokeObjectURL(audioUrl);setAudioBlob(blob);setAudioUrl(URL.createObjectURL(blob));stream.getTracks().forEach(t=>t.stop());streamRef.current=null}
      recorderRef.current=recorder;setSeconds(0);setAudioBlob(null);setAudioUrl(null);recorder.start();setIsRecording(true)
    }catch{setError('Microphone access is required to record your mission.')}
  }
  function stopRecording(){recorderRef.current?.stop();recorderRef.current=null;setIsRecording(false)}
  function reset(){if(isRecording)stopRecording();if(audioUrl)URL.revokeObjectURL(audioUrl);setAudioBlob(null);setAudioUrl(null);setSeconds(0);setError(null)}
  async function submit(){
    if(!audioBlob)return
    setSubmitting(true);setError(null)
    const form=new FormData();form.append('studentEmail',studentEmail);form.append('durationSeconds',String(seconds));form.append('audio',audioBlob,'professional-introduction.webm')
    try{const r=await fetch('/api/dashboard/action/audio',{method:'POST',body:form});if(!r.ok){const d=await r.json().catch(()=>null);throw new Error(d?.error||'Submission failed')}setSubmitted(true)}
    catch(e){setError(e instanceof Error?e.message:'Submission failed. Please try again.')}finally{setSubmitting(false)}
  }

  if(submitted)return <div className="space-y-5">
    <article className="rounded-[28px] border border-emerald-300/30 bg-emerald-300/10 p-7 text-center">
      <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-300"/><p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Submit successful</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Mission received.</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-prime-cream/75">Your recording is saved for teacher review. It does not change your learning record until your teacher reviews it.</p>
    </article>
    <article className="rounded-[28px] border border-sky-300/20 bg-sky-300/5 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">Next mission</p>
      <h3 className="mt-2 text-xl font-semibold text-white">Review your next class and continue your interview preparation.</h3>
      <p className="mt-2 text-sm leading-6 text-prime-cream/70">Your next live session is booked separately and is confirmed after advance payment.</p>
      {nextMissionUrl?<a href={nextMissionUrl} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0a235c]">Review next mission <ArrowRight className="h-4 w-4"/></a>:null}
    </article>
  </div>

  return <div className="space-y-5">
    <article className="rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-prime-cream/55">Your next mission</p><h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-prime-cream/80">{description}</p>
      {materialUrl?<a href={materialUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-200">Review Maritime Interview Mission <ExternalLink className="h-4 w-4"/></a>:null}
    </article>
    <div className="grid gap-4 lg:grid-cols-2">{[['01','Present','Who you are and the maritime professional you are becoming.'],['02','Prepare','Your maritime training and the experience most relevant to the role.'],['03','Prove','One real example that demonstrates competence, judgment or responsibility.'],['04','Purpose','The opportunity you are seeking and why you are ready for the next step.']].map(([n,h,c])=><article key={n} className="rounded-2xl border border-white/10 bg-black/15 p-5"><p className="text-xs font-semibold text-sky-300">{n}</p><h3 className="mt-2 font-semibold text-white">{h}</h3><p className="mt-2 text-sm leading-6 text-prime-cream/72">{c}</p></article>)}</div>
    {vocabulary.length?<article className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Reuse at least two</p><div className="mt-3 flex flex-wrap gap-2">{vocabulary.slice(0,5).map(term=><span key={term} className="rounded-full border border-amber-200/20 px-3 py-1.5 text-sm text-prime-cream/85">{term}</span>)}</div></article>:null}
    <article className="rounded-[28px] border border-sky-300/20 bg-sky-300/5 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">60–90 second recording</p><p className="mt-2 text-3xl font-semibold text-white">{seconds}s</p>
      <p className="mt-2 text-xs text-prime-cream/55">Record, listen, try again if needed, then submit your best take.</p>
      <div className="mt-4 flex flex-wrap gap-2">{!isRecording?<button onClick={startRecording} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0a235c]"><Mic className="h-4 w-4"/>Record</button>:<button onClick={stopRecording} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0a235c]"><Square className="h-4 w-4"/>Stop</button>}<button onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white"><RotateCcw className="h-4 w-4"/>Try again</button></div>
      {audioUrl?<div className="mt-5 rounded-2xl border border-white/10 bg-black/15 p-4"><div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><Play className="h-4 w-4"/>Listen to your take</div><audio controls src={audioUrl} className="w-full"/><button disabled={submitting} onClick={submit} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-950 disabled:opacity-50"><Upload className="h-4 w-4"/>{submitting?'Submitting…':'Submit to my teacher'}</button></div>:null}
      {error?<p className="mt-4 text-sm text-red-200">{error}</p>:null}
      <p className="mt-4 text-xs leading-5 text-prime-cream/50">After Submit, the recording is stored securely as a learner submission for teacher review. It is not automatically treated as teacher-confirmed learning evidence.</p>
    </article>
  </div>
}

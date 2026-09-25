import type { Metadata } from 'next'
import Link from 'next/link'
import claudioProfile from '@/data/students/claudio-bit-gmail-com.firestore.json'

export const metadata: Metadata = {
  title: 'Cláudio • PRIME Learning Journey | Prime Digital Hub',
  description: 'Cláudio Bittencourt — PRIME Learning Journey.',
  robots: { index: false, follow: false, nocache: true },
}

const p = claudioProfile
const cp = p.canonicalProjection

function Card({children, className=''}:{children:React.ReactNode,className?:string}) {
  return <article className={`rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm ${className}`}>{children}</article>
}
function Kicker({children}:{children:React.ReactNode}) {
  return <p className="text-xs font-black uppercase tracking-[0.22em] text-[#e60023]">{children}</p>
}

export default function ClaudioJourneyPage() {
  return <main className="min-h-screen bg-[#f7fbff] text-[#0b2c5c]">
    <header className="border-b border-blue-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <img src="/brand/prime-digital-hub-full-transparent.png" alt="Prime Digital Hub" className="h-auto w-44"/>
        <span className="rounded-full border border-blue-200 px-4 py-2 text-xs font-bold">PRIME Learning Journey</span>
      </div>
    </header>

    <section className="bg-gradient-to-br from-[#eef7ff] via-white to-[#fff2f3]">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <Kicker>YOUR PRIME LEARNING DASHBOARD</Kicker>
        <h1 className="mt-3 text-5xl font-black tracking-tight md:text-6xl">What matters now, Cláudio.</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">A clear view of your journey: where you are, what your lessons show, what stays useful and where we go next.</p>
        <div className="mt-6 flex flex-wrap gap-2 text-sm font-bold">
          <span className="rounded-full bg-white px-4 py-2 shadow-sm">{p.attendanceRate}</span>
          <span className="rounded-full bg-white px-4 py-2 shadow-sm">{p.currentLevel} → {p.targetLevel} direction</span>
          <span className="rounded-full bg-white px-4 py-2 shadow-sm">Learning history available</span>
        </div>
      </div>
    </section>

    <div className="mx-auto max-w-6xl space-y-10 px-5 py-10">
      <section>
        <Kicker>NOW · CURRENT STATE</Kicker>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card><p className="text-xs font-black text-slate-400">CURRENT LEVEL</p><h2 className="mt-2 text-3xl font-black">{p.currentLevel}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{cp.currentState.level.qualifier}</p></Card>
          <Card><p className="text-xs font-black text-slate-400">TARGET LEVEL</p><h2 className="mt-2 text-3xl font-black">{p.targetLevel}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{cp.currentState.targetLevel.qualifier}</p></Card>
          <Card><p className="text-xs font-black text-slate-400">OBJECTIVE</p><h2 className="mt-2 text-xl font-black">{cp.currentState.objective.value}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{cp.currentState.objective.qualifier}</p></Card>
          <Card><p className="text-xs font-black text-slate-400">LEARNING FOCUS</p><h2 className="mt-2 text-xl font-black">{cp.currentState.focus.value}</h2></Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-3">
          <Kicker>WHAT YOUR LEARNING JOURNEY SHOWS</Kicker>
          <div className="mt-5 grid gap-6 md:grid-cols-3">
            <div><p className="text-xs font-black text-slate-400">WHAT HAPPENED</p><p className="mt-2 leading-7 text-slate-700">Three confirmed lessons preserve real conversation across personal topics, technology, AI, scuba diving, health, aviation, economics and logistics.</p></div>
            <div><p className="text-xs font-black text-slate-400">WHAT WE CAN SEE</p><p className="mt-2 leading-7 text-slate-700">Cláudio sustains complex conversation and brings strong reasoning and domain knowledge. The B2 opportunity is greater precision, organization and automaticity.</p></div>
            <div><p className="text-xs font-black text-slate-400">WHAT WE ARE STILL CHECKING</p><p className="mt-2 leading-7 text-slate-700">One successful response does not mean a skill is fully established yet. Older learning notes without a recovered lesson date remain part of the learning memory, but are not counted as attendance.</p></div>
          </div>
        </Card>
      </section>

      <section>
        <Kicker>RECENT · THE JOURNEY SO FAR</Kicker>
        <h2 className="mt-2 text-3xl font-black">Three confirmed lessons. One connected journey.</h2>
        <div className="mt-5 space-y-4">{p.attendanceOverview.map((x)=><Card key={x.id}>
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-black text-[#e60023]">{x.date}</p><h3 className="mt-1 text-xl font-black">{x.title}</h3></div><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">ATTENDED</span></div>
          <p className="mt-3 leading-7 text-slate-700">{x.summary}</p>
        </Card>)}</div>
      </section>

      <section>
        <Kicker>MEMORY · WHAT STAYS USEFUL</Kicker>
        <h2 className="mt-2 text-3xl font-black">What your lessons show</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">{p.progressTracker.map((x)=><Card key={x.id}><p className="text-xs font-black uppercase text-[#0057b8]">{x.status}</p><h3 className="mt-2 text-xl font-black">{x.title}</h3><p className="mt-2 leading-7 text-slate-600">{x.insight}</p></Card>)}</div>
      </section>

      <section id="vocabulary-bank">
        <Kicker>VOCABULARY TO REUSE</Kicker>
        <h2 className="mt-2 text-3xl font-black">Choose a word and use it in a sentence of your own.</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{p.vocabularyBank.filter(x=>['active ingredient','side effects','blood sugar','liver','appetite'].includes(x.term)).map(x=><Card key={x.id}><p className="text-xs font-black text-[#e60023]">REUSE NOW</p><h3 className="mt-2 text-xl font-black">{x.term}</h3><p className="mt-3 text-xs font-black text-slate-400">YOUR WORDS</p><p className="mt-1 text-sm leading-6 text-slate-600">{x.meaning}</p><p className="mt-4 text-xs font-black text-slate-400">WRITE YOUR OWN SENTENCE</p><div className="mt-2 h-12 rounded-xl border border-dashed border-blue-200 bg-blue-50/40"/></Card>)}</div>
      </section>

      <section id="grammar-overview">
        <Card>
          <Kicker>{p.grammarOverview.title}</Kicker>
          <p className="mt-4 text-lg leading-8 text-slate-700">{p.grammarOverview.summary}</p>
          <ul className="mt-5 grid gap-3 md:grid-cols-2">{p.grammarOverview.focusPoints.map(x=><li key={x} className="rounded-2xl bg-blue-50 p-4 text-sm font-semibold leading-6">{x}</li>)}</ul>
        </Card>
      </section>

      <section>
        <Kicker>NOW + NEXT · YOUR FOCUS</Kicker>
        <div className="mt-5 grid gap-4 md:grid-cols-2">{cp.priorities.map(x=><Card key={x.id}><h3 className="text-xl font-black">{x.title}</h3><p className="mt-2 leading-7 text-slate-600">{x.why}</p></Card>)}</div>
      </section>

      <section className="rounded-[34px] bg-[#0b2c5c] p-7 text-white shadow-xl md:p-9">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">NEXT STEP · YOUR LEARNING ACTION</p>
        <h2 className="mt-3 text-4xl font-black">{cp.nextAction.title}</h2>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-blue-50">{cp.nextAction.description}</p>
        <p className="mt-3 text-sm text-blue-200">Goal: {cp.nextAction.outcome}</p>
        <Link href={cp.nextAction.destination} className="mt-6 inline-flex rounded-2xl bg-[#e60023] px-6 py-3 font-black text-white shadow-lg">OPEN NEXT STEP →</Link>
      </section>

      <section>
        <Kicker>YOUR LEARNING JOURNEY</Kicker>
        <Card className="mt-4">
          <h2 className="text-3xl font-black">What this journey tells us now</h2>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-700">{p.teacherFeedback[0].body}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-blue-50 p-5"><p className="text-xs font-black text-slate-400">NEXT ACTION</p><p className="mt-2 font-black">Diving Decision Project</p></div>
            <div className="rounded-2xl bg-blue-50 p-5"><p className="text-xs font-black text-slate-400">YOUR TEACHER</p><p className="mt-2 font-black">Connects your lessons and guides what comes next</p></div>
            <div className="rounded-2xl bg-blue-50 p-5"><p className="text-xs font-black text-slate-400">CONTINUITY</p><p className="mt-2 font-black">VIP Conversation Class · once a week</p></div>
          </div>
        </Card>
      </section>

      <footer className="border-t border-blue-100 py-7 text-center text-xs font-bold text-slate-500">PRIME DIGITAL HUB · Teacher: Alexandre Mello · Better English, Brighter Future</footer>
    </div>
  </main>
}

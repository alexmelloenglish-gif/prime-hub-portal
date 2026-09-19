import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  Compass,
  MessageCircle,
  Microscope,
  RefreshCw,
  Sparkles,
  Star,
  Target,
  Trophy,
} from 'lucide-react'
import type { StudentDashboardData } from '@/lib/student-data'

type Props = {
  student: StudentDashboardData
  publicMode?: boolean
}

const progressIcons = [MessageCircle, RefreshCw, Brain, CheckCircle2, Sparkles, Microscope]

function statusLabel(status: string) {
  const key = status.toLowerCase()
  if (key.includes('strong')) return 'SUPER STRONG'
  if (key.includes('improv') || key.includes('develop')) return 'GROWING'
  if (key.includes('focus')) return 'NEXT MISSION'
  return 'IN PROGRESS'
}

export function YoungLearnerJourneyDashboard({ student, publicMode = false }: Props) {
  const projection = student.canonicalProjection
  const firstName = student.studentName.split(' ')[0]
  const attended = student.attendanceOverview.filter((lesson) => lesson.status === 'present')
  const journeyHref = '/journey/gustavo-5-lessons-7q4m9/check-in'

  return (
    <main className="min-h-screen bg-[#f7fbff] text-[#0b2c5c]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#eef7ff] via-white to-[#fff2f3]">
        <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-[#e60023]/10 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[#0057b8]/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <img
              src="/brand/prime-digital-hub-full-transparent.png"
              alt="Prime Digital Hub"
              className="h-auto w-40 sm:w-52"
            />
            <div className="rounded-full border border-blue-200 bg-white/90 px-4 py-2 text-xs font-bold text-[#0b2c5c] shadow-sm">
              5 aulas • 5 adventures ⭐
            </div>
          </div>

          {publicMode ? (
            <div className="mb-5 inline-flex rounded-full bg-[#0b2c5c] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white">
              Family Journey View • Carol & Guilherme
            </div>
          ) : null}

          <div className="grid items-center gap-7 lg:grid-cols-[1.25fr_.75fr]">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#e60023]">
                My English Journey
              </p>
              <h1 className="mt-3 max-w-4xl text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl md:text-6xl">
                Hi, {firstName}! 👋
                <span className="mt-2 block text-[#0057b8]">Olha quanta coisa seu inglês já fez.</span>
              </h1>
              <p className="mt-5 max-w-3xl text-base font-medium leading-7 text-slate-700 sm:text-lg">
                Aqui você não vai ver só “matérias”. Você vai ver a sua jornada:
                o que você tentou, o que voltou, o que precisou de ajuda e o que você já começou a perceber sozinho.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={journeyHref}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#e60023] px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-200 transition hover:-translate-y-0.5"
                >
                  <Sparkles className="h-4 w-4" />
                  FAZER MEU CHECK-IN
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-[#0b2c5c] shadow-sm">
                  <CalendarDays className="h-4 w-4 text-[#0057b8]" />
                  {student.attendanceRate}
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-sm">
              <div className="rounded-[34px] border border-blue-200 bg-[#0b2c5c] p-6 text-white shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                    <Trophy className="h-8 w-8 text-yellow-300" />
                  </div>
                  <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-extrabold text-emerald-200">
                    KEEP GOING!
                  </span>
                </div>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-blue-200">WHERE I AM NOW</p>
                <p className="mt-2 text-2xl font-black">{student.currentLevel}</p>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full w-[58%] rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" />
                </div>
                <p className="mt-3 text-sm leading-6 text-blue-100">
                  Caminhando em direção ao <strong className="text-white">{student.targetLevel}</strong>.
                  O importante não é correr: é perceber o que você já consegue fazer com inglês.
                </p>
              </div>
              <div className="absolute -bottom-5 -left-5 rotate-[-4deg] rounded-2xl bg-yellow-300 px-4 py-3 text-sm font-black text-[#0b2c5c] shadow-lg">
                Cada passo conta! ⭐
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-9 sm:px-6">
        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[28px] border border-blue-200 bg-white p-5 shadow-sm md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-[#0057b8]">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0057b8]">WHAT CHANGED?</p>
                <h2 className="text-xl font-black">O filme da sua jornada</h2>
              </div>
            </div>
            <h3 className="mt-5 text-2xl font-black leading-tight text-[#0b2c5c]">
              {projection.whatChanged?.title}
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-700">
              {projection.whatChanged?.summary}
            </p>
            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0057b8]">HUMAN EVIDENCE</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                A evidência registra o que aconteceu. A interpretação do professor conecta os pontos.
                Nenhuma aula precisa “provar progresso” sozinha para fazer parte da história.
              </p>
            </div>
          </article>

          <article className="rounded-[28px] bg-[#e60023] p-5 text-white shadow-lg shadow-red-100">
            <Compass className="h-8 w-8" />
            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-red-100">YOUR DIRECTION</p>
            <h2 className="mt-2 text-2xl font-black">Para onde estamos indo?</h2>
            <p className="mt-3 text-sm leading-7 text-red-50">
              {projection.currentState.objective.value}
            </p>
          </article>
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#e60023]">YOUR LEARNING POWERS</p>
              <h2 className="mt-1 text-3xl font-black">Coisas que já estão aparecendo ✨</h2>
            </div>
            <span className="hidden rounded-full bg-blue-100 px-4 py-2 text-xs font-bold text-[#0057b8] sm:inline">
              movement ≠ only state change
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {student.progressTracker.map((item, index) => {
              const Icon = progressIcons[index % progressIcons.length]
              return (
                <article key={item.id} className="group rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef7ff] text-[#0057b8]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-800">
                      {statusLabel(item.status)}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.insight}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="rounded-[32px] border border-blue-200 bg-gradient-to-br from-[#0b2c5c] to-[#0057b8] p-5 text-white shadow-xl md:p-7">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-cyan-200" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">5 LESSONS • 5 CHAPTERS</p>
              <h2 className="text-2xl font-black">Sua história até aqui</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            {attended.map((lesson, index) => (
              <article key={lesson.id} className="grid gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 sm:grid-cols-[54px_1fr]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-black text-[#0b2c5c]">
                  {index + 1}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black">{lesson.title}</h3>
                    <span className="rounded-full bg-emerald-300/20 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-100">
                      attended
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-blue-200">{lesson.date}</p>
                  <p className="mt-2 text-sm leading-6 text-blue-50">{lesson.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <article className="rounded-[30px] border border-emerald-200 bg-emerald-50 p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-emerald-700" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">REAL EVIDENCE</p>
                <h2 className="text-2xl font-black">Coisas que você fez de verdade</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">You noticed & repaired</p>
                <p className="mt-2 text-lg font-black text-[#0b2c5c]">“I don’t...” → “No, I didn’t.”</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Você percebeu que a pergunta estava no passado e tentou de novo.</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">You reused language</p>
                <p className="mt-2 text-lg font-black text-[#0b2c5c]">went • drank • did • didn’t</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Palavras e estruturas voltaram em novas situações, não apenas no exercício em que apareceram.</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">English became a tool</p>
                <p className="mt-2 text-lg font-black text-[#0b2c5c]">“The large intestine absorbs water.”</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Você usou inglês para chegar até um conhecimento de Science — não só para “estudar inglês”.</p>
              </div>
            </div>
          </article>

          <article className="rounded-[30px] border border-violet-200 bg-violet-50 p-6">
            <div className="flex items-center gap-3">
              <Target className="h-7 w-7 text-violet-700" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">WHAT MATTERS NOW</p>
                <h2 className="text-2xl font-black">Próximas missões</h2>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {projection.priorities.map((priority, index) => (
                <div key={priority.id} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-700 text-xs font-black text-white">{index + 1}</span>
                    <div>
                      <h3 className="font-black">{priority.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{priority.why}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-[34px] border border-yellow-300 bg-gradient-to-br from-yellow-100 via-white to-red-50 p-6 shadow-lg md:p-8">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="flex items-center gap-3">
                <Star className="h-7 w-7 fill-yellow-400 text-yellow-500" />
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e60023]">NOW IT’S YOUR TURN</p>
              </div>
              <h2 className="mt-3 text-3xl font-black">Gustavo, o que VOCÊ acha da sua jornada?</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
                A máquina e o professor têm evidências. Mas existe uma parte que só você pode contar:
                como você acha que se sairia se tentasse essas coisas novamente hoje?
              </p>
              <p className="mt-2 text-sm font-bold text-[#0b2c5c]">
                Não é prova. Sua percepção também é uma parte importante da aprendizagem.
              </p>
            </div>
            <Link
              href={journeyHref}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0b2c5c] px-6 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5"
            >
              MY ENGLISH JOURNEY
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <article className="rounded-[30px] border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-[#0057b8]" />
              <h2 className="text-2xl font-black">{student.grammarOverview.title}</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">{student.grammarOverview.summary}</p>
            <div className="mt-4 space-y-2">
              {student.grammarOverview.focusPoints.slice(0, 6).map((point) => (
                <div key={point} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                  {point}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[30px] border border-blue-200 bg-[#eef7ff] p-6">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-[#0057b8]" />
              <h2 className="text-2xl font-black">What comes next?</h2>
            </div>
            <h3 className="mt-4 text-xl font-black">{projection.nextAction?.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-700">{projection.nextAction?.description}</p>
            <div className="mt-5 rounded-2xl border border-blue-200 bg-white p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0057b8]">THE BIG IDEA</p>
              <p className="mt-2 text-sm font-bold leading-6 text-[#0b2c5c]">
                Every lesson has a direction. Nem toda aula precisa terminar em uma “nova fase”.
                Às vezes aprender é voltar, conectar, perceber, tentar de novo — e continuar.
              </p>
            </div>
          </article>
        </section>

        {publicMode ? (
          <section className="rounded-[30px] border border-slate-200 bg-white p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e60023]">FOR THE FAMILY</p>
            <h2 className="mt-2 text-2xl font-black">Carol & Guilherme: o que esta leitura significa?</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Este painel não transforma cada aula em uma nota nem força uma narrativa de avanço linear.
              Ele reúne episódios reais, tentativas, apoios, retornos, autocorreções e conexões para tornar a jornada mais visível.
              O objetivo é que Gustavo desenvolva inglês e, ao mesmo tempo, fique cada vez melhor em observar como ele próprio aprende.
            </p>
          </section>
        ) : null}

        <footer className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 py-6 text-center sm:flex-row sm:text-left">
          <img src="/brand/prime-digital-hub-full-transparent.png" alt="Prime Digital Hub" className="h-auto w-36" />
          <div className="text-xs font-bold text-slate-500">
            <p>BETTER ENGLISH, BRIGHTER FUTURE</p>
            <p className="mt-1">www.primedigitalhub.com.br</p>
          </div>
        </footer>
      </div>
    </main>
  )
}

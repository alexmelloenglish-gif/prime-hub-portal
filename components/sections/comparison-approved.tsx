import { ArrowRight, Check, Star, TrendingUp, Users, X } from 'lucide-react'

const otherMethodsPersonImage = '/assets/other-methods-person.webp'
const primeContextPersonImage = '/assets/prime-context-person-hq.webp'
const primeLogo = '/brand/prime-digital-hub-full-transparent.png'

const leftPoints = [
  'Aulas genéricas e sem contexto',
  'Foco em regras, não em comunicação',
  'Pouca prática real',
  'Você estuda, mas ainda não se sente confiante',
  'Resultados que demoram (ou não chegam)',
]

const rightPoints = [
  'Aulas personalizadas para os seus objetivos',
  'Inglês real, aplicado à sua vida',
  'Prática com suporte de professores que te conhecem',
  'Você se sente mais confiante a cada etapa',
  'Resultados que você vê e sente na prática',
]

export function ComparisonApprovedSection() {
  return (
    <section id="comparativo" className="relative overflow-hidden border-y border-slate-200 bg-[#fbfcfe] py-14 sm:py-18">
      <div className="container min-w-0">
        <div className="mx-auto mb-9 max-w-5xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#0b2c5c] sm:text-sm">Aprender inglês pode ser diferente</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.035em] text-[#0b2c5c] md:text-6xl">
            Mesma meta. <span className="text-prime-red">Experiências diferentes.</span>
          </h2>
          <p className="mt-3 text-lg text-slate-700 sm:text-2xl">Compare e veja por que a PRIME funciona.</p>
        </div>

        <div className="relative grid min-w-0 gap-5 lg:grid-cols-2">
          <article className="min-w-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-[#f2f2f2] shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
            <div className="grid min-h-[560px] min-w-0 md:grid-cols-[1.03fr_.97fr]">
              <div className="min-w-0 p-6 sm:p-8">
                <span className="inline-flex rounded-full bg-white px-5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#0b2c5c] shadow-sm sm:text-sm">Em outras escolas e métodos</span>
                <h3 className="mt-7 font-display text-4xl font-extrabold leading-[1.02] text-[#0b2c5c]">Mais esforço.<br />Menos resultado.</h3>
                <ul className="mt-8 space-y-5">
                  {leftPoints.map((point) => (
                    <li key={point} className="flex gap-3 text-base leading-6 text-slate-700">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-500 text-white"><X className="h-4 w-4" /></span>
                      <span className="min-w-0">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative min-h-[410px] overflow-hidden bg-slate-200 md:min-h-full">
                <img
                  src={otherMethodsPersonImage}
                  alt="Aluna frustrada com uma experiência genérica de aprendizagem"
                  className="absolute inset-0 h-full w-full object-cover object-center grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/28 via-transparent to-white/5" />
                <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-slate-950/78 px-5 py-5 text-center text-lg italic leading-7 text-white backdrop-blur-sm">
                  “Eu estudo, estudo, mas parece que não saio do lugar...”
                </div>
              </div>
            </div>
          </article>

          <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-prime-red text-white shadow-xl ring-4 ring-white lg:flex">
            <ArrowRight className="h-8 w-8" />
          </div>

          <article className="min-w-0 overflow-hidden rounded-[2rem] border border-red-100 bg-[#fff8f6] shadow-[0_22px_60px_rgba(168,34,23,0.10)]">
            <div className="grid min-h-[560px] min-w-0 md:grid-cols-[1.03fr_.97fr]">
              <div className="min-w-0 p-6 sm:p-8">
                <span className="inline-flex rounded-full bg-prime-red px-5 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-sm">Com a PRIME</span>
                <h3 className="mt-7 font-display text-4xl font-extrabold leading-[1.02] text-[#0b2c5c]">
                  Mais clareza.<br />Mais progresso.<br /><span className="text-prime-red">Mais você.</span>
                </h3>
                <ul className="mt-8 space-y-5">
                  {rightPoints.map((point) => (
                    <li key={point} className="flex gap-3 text-base leading-6 text-slate-700">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-prime-red text-white"><Check className="h-4 w-4" /></span>
                      <span className="min-w-0">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative min-h-[430px] overflow-hidden bg-[#f7eee9] md:min-h-full">
                <img
                  src={primeContextPersonImage}
                  alt="Aluna PRIME estudando com confiança, personalização e acompanhamento"
                  className="absolute inset-0 h-full w-full object-cover object-center brightness-[1.02] contrast-[1.02] saturate-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b2c5c]/18 via-transparent to-white/5" />

                <div className="absolute right-4 top-4 rounded-2xl border border-white/70 bg-white/94 px-4 py-3 text-right shadow-lg backdrop-blur-sm">
                  <p className="font-display text-lg font-bold leading-tight text-[#0b2c5c]">Better English.</p>
                  <p className="font-display text-lg font-bold leading-tight text-[#0b2c5c]">Brighter Future.</p>
                  <div className="ml-auto mt-2 h-1 w-12 rounded-full bg-prime-red" />
                </div>

                <div className="absolute bottom-24 left-1/2 w-[68%] -translate-x-1/2 rounded-2xl border border-white/70 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm">
                  <img src={primeLogo} alt="Prime Digital Hub" className="mx-auto h-auto max-h-16 w-auto object-contain" />
                </div>

                <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-prime-red/96 px-5 py-5 text-center text-lg italic leading-7 text-white shadow-lg">
                  “Agora eu vejo o meu progresso e me sinto mais eu.”
                </div>
              </div>
            </div>
          </article>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 font-semibold text-[#0b2c5c] shadow-sm">
            <Users className="h-6 w-6 shrink-0 text-prime-red" />
            <span>Mais que aulas</span>
          </div>
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 font-semibold text-[#0b2c5c] shadow-sm">
            <TrendingUp className="h-6 w-6 shrink-0 text-prime-red" />
            <span>Mais conquistas</span>
          </div>
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 font-semibold text-[#0b2c5c] shadow-sm">
            <Star className="h-6 w-6 shrink-0 text-prime-red" />
            <span>Mais você</span>
          </div>
        </div>
      </div>
    </section>
  )
}

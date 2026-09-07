import { ArrowRight, Check, Globe2, Plane, Star, Users, X } from 'lucide-react'

const otherMethodsPersonImage = '/assets/other-methods-person.webp'
const primeContextPersonImage = '/assets/prime-context-person-hq.webp'
const primeLogo = '/brand/prime-digital-hub-full-transparent.png'

const leftPoints = [
  'Aulas genéricas e sem contexto',
  'Foco em regras, não em comunicação',
  'Pouca prática real',
  'Você estuda, mas não se sente ainda confiante',
  'Resultados que demoram (ou não chegam)',
]

const rightPoints = [
  'Aulas personalizadas para os seus objetivos',
  'Inglês real, aplicado à sua vida',
  'Prática com suporte de professores que te conhecem',
  'Você se sente mais confiante a cada etapa',
  'Resultados que você vê e sente na prática',
]

const benefits = [
  { icon: Globe2, text: 'Mais oportunidades' },
  { icon: Star, text: 'Mais confiança' },
  { icon: Users, text: 'Mais conexões' },
  { icon: Plane, text: 'Mais liberdade' },
  { icon: Star, text: 'Um futuro mais brilhante' },
]

export function ComparisonApprovedSection() {
  return (
    <section id="comparativo" className="relative overflow-hidden border-y border-slate-200 bg-white py-14 sm:py-18">
      <div className="container">
        <div className="mx-auto mb-8 max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#0b2c5c]">Aprender inglês pode ser diferente</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.035em] text-[#0b2c5c] md:text-6xl">
            Mesma meta. <span className="text-prime-red">Experiências diferentes.</span>
          </h2>
          <p className="mt-3 text-lg text-slate-700 sm:text-2xl">Compare e veja por que a PRIME funciona.</p>
        </div>

        <div className="relative grid gap-5 lg:grid-cols-2">
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[#f2f2f2] shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
            <div className="grid min-h-[540px] md:grid-cols-[1.05fr_.95fr]">
              <div className="p-6 sm:p-8">
                <span className="inline-flex rounded-full bg-white px-5 py-2 text-sm font-bold uppercase tracking-wide text-[#0b2c5c] shadow-sm">Outros métodos</span>
                <h3 className="mt-7 font-display text-4xl font-extrabold leading-[1.02] text-[#0b2c5c]">Mais esforço.<br />Menos resultado.</h3>
                <ul className="mt-8 space-y-5">
                  {leftPoints.map((point) => (
                    <li key={point} className="flex gap-3 text-base leading-6 text-slate-700">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-500 text-white"><X className="h-4 w-4" /></span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative min-h-[360px] bg-slate-200 md:min-h-full">
                <img src={otherMethodsPersonImage} alt="Aluna frustrada com uma experiência de aprendizagem sem continuidade" className="absolute inset-0 h-full w-full object-cover grayscale" />
                <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-slate-900/75 px-5 py-5 text-center text-lg italic text-white backdrop-blur-sm">“Eu estudo, estudo, mas parece que não saio do lugar...”</div>
              </div>
            </div>
          </article>

          <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-prime-red text-white shadow-xl ring-4 ring-white lg:flex">
            <ArrowRight className="h-8 w-8" />
          </div>

          <article className="overflow-hidden rounded-[2rem] border border-red-100 bg-[#fff7f2] shadow-[0_22px_60px_rgba(168,34,23,0.10)]">
            <div className="grid min-h-[540px] md:grid-cols-[1.05fr_.95fr]">
              <div className="p-6 sm:p-8">
                <span className="inline-flex rounded-full bg-prime-red px-5 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-sm">Com a PRIME</span>
                <h3 className="mt-7 font-display text-4xl font-extrabold leading-[1.02] text-[#0b2c5c]">Mais clareza.<br />Mais progresso.<br /><span className="text-prime-red">Mais você.</span></h3>
                <ul className="mt-8 space-y-5">
                  {rightPoints.map((point) => (
                    <li key={point} className="flex gap-3 text-base leading-6 text-slate-700">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-prime-red text-white"><Check className="h-4 w-4" /></span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative min-h-[380px] bg-[#f6eadf] md:min-h-full">
                <img src={primeContextPersonImage} alt="Aluna do PRIME estudando com confiança e contexto" className="absolute inset-0 h-full w-full object-cover object-center" />
                <div className="absolute right-4 top-4 rounded-xl bg-white/92 px-4 py-3 text-right shadow-lg backdrop-blur-sm">
                  <p className="font-display text-lg font-bold text-[#0b2c5c]">Better English,</p>
                  <p className="font-display text-lg font-bold text-[#0b2c5c]">Brighter Future.</p>
                  <div className="mt-2 h-1 w-12 rounded-full bg-prime-red ml-auto" />
                </div>
                <div className="absolute bottom-24 left-1/2 w-[58%] -translate-x-1/2 rounded-2xl bg-white/95 p-3 shadow-xl backdrop-blur-sm">
                  <img src={primeLogo} alt="Prime Digital Hub" className="mx-auto h-auto max-h-16 w-auto object-contain" />
                </div>
                <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-prime-red/95 px-5 py-5 text-center text-lg italic text-white shadow-lg">“Agora eu vejo o meu progresso e me sinto mais eu.”</div>
              </div>
            </div>
          </article>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {benefits.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center justify-center gap-3 rounded-2xl border border-red-100 bg-white px-4 py-4 text-center font-semibold text-[#0b2c5c] shadow-sm">
              <Icon className="h-6 w-6 shrink-0 text-prime-red" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

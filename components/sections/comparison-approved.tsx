import { ArrowRight, Check, Heart, TrendingUp, Users, X } from 'lucide-react'

const comparisons = [
  {
    prime: false,
    label: 'Em outras escolas e métodos',
    image: '/assets/comparison-other-approved.webp',
    alt: 'Aluna de coque e suéter cinza, apoiando a cabeça na mão diante de um caderno',
    title: <>Mais esforço.<br />Menos resultado.</>,
    points: [
      'Aulas genéricas e sem contexto',
      'Foco em regras, não em comunicação',
      'Pouca prática real',
      'Você estuda, mas ainda não se sente confiante',
      'Resultados que demoram (ou não chegam)',
    ],
    quote: '“Eu estudo, estudo, mas parece que não saio do lugar...”',
  },
  {
    prime: true,
    label: 'Com a PRIME',
    image: '/assets/comparison-prime-approved.webp',
    alt: 'Aluna PRIME de cabelos cacheados presos, blusa preta e caneta na mão, com caderno vermelho',
    title: <>Mais clareza.<br />Mais progresso.<br />Mais você.</>,
    points: [
      'Aulas personalizadas para os seus objetivos',
      'Inglês real, aplicado à sua vida',
      'Prática com suporte de professores que te conhecem',
      'Você se sente mais confiante a cada etapa',
      'Resultados que você vê e sente na prática',
    ],
    quote: '“Agora eu vejo o meu progresso e me sinto mais eu.”',
  },
]

export function ComparisonApprovedSection() {
  return (
    <section id="comparativo" className="relative overflow-hidden border-y border-slate-200 bg-[#fbfcfe] py-14 sm:py-20">
      <div className="container min-w-0">
        <div className="mx-auto mb-9 max-w-6xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-prime-red sm:text-sm">Antes e depois</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#0b2c5c] sm:text-4xl xl:text-5xl">
            Quando a educação preserva a memória pedagógica, o aluno assume a direção com clareza e confiança.
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">Não é sobre acumular dados. É sobre transformar cada aula em contexto para a próxima.</p>
        </div>

        <div className="relative grid min-w-0 items-stretch gap-6 lg:grid-cols-2">
          {comparisons.map(({ prime, label, image, alt, title, points, quote }) => (
            <article key={label} className={`relative flex min-w-0 flex-col overflow-hidden rounded-[1.75rem] border shadow-xl ${prime ? 'border-red-100 bg-[#fff4e8]' : 'border-slate-200 bg-[#eeeeee]'}`}>
              <div className="relative order-2 h-[390px] overflow-hidden sm:h-[460px] lg:absolute lg:inset-0 lg:h-full">
                <img src={image} alt={alt} width={1122} height={1402} className="h-full w-full object-cover object-right lg:object-center" />
              </div>
              <div aria-hidden="true" className={`pointer-events-none absolute inset-0 hidden lg:block ${prime ? 'bg-[linear-gradient(90deg,rgba(255,244,232,0.96)_0%,rgba(255,244,232,0.88)_28%,rgba(255,244,232,0)_66%)]' : 'bg-[linear-gradient(90deg,rgba(238,238,238,0.96)_0%,rgba(238,238,238,0.88)_28%,rgba(238,238,238,0)_66%)]'}`} />
              <div className="relative z-10 order-1 p-6 sm:p-8 lg:min-h-[600px] lg:w-[58%] lg:px-6 lg:pb-6 xl:min-h-[630px]">
                <span className={`inline-flex max-w-full rounded-full px-4 py-2 text-xs font-bold uppercase leading-5 tracking-wide text-white ${prime ? 'bg-prime-red' : 'bg-slate-600'}`}>{label}</span>
                <h3 className="mt-6 font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-[#0b2c5c] xl:text-[2rem]">{title}</h3>
                <ul className="mt-7 space-y-4">
                  {points.map(point => (
                    <li key={point} className="flex gap-3 text-base leading-6 text-slate-900">
                      <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${prime ? 'bg-emerald-700' : 'bg-slate-600'}`}>
                        {prime ? <Check className="h-4 w-4" aria-hidden="true" /> : <X className="h-4 w-4" aria-hidden="true" />}
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`relative z-10 order-3 m-5 flex flex-col items-center gap-4 rounded-2xl px-5 py-5 text-center text-white lg:mt-auto ${prime ? 'bg-prime-red' : 'bg-slate-800'}`}>
                <blockquote className="text-lg italic leading-7">{quote}</blockquote>
                {prime && <div className="rounded-lg bg-white px-4 py-2"><img src="/brand/prime-digital-hub-full-transparent.png" alt="Prime Digital Hub" width={353} height={156} className="h-10 w-auto" /></div>}
              </div>
            </article>
          ))}
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-prime-red text-white shadow-xl ring-4 ring-white lg:flex">
            <ArrowRight className="h-7 w-7" />
          </div>
        </div>

        <div className="mx-auto mt-7 grid max-w-4xl gap-4 sm:grid-cols-3">
          {[{ icon: Users, text: 'Mais que aulas' }, { icon: TrendingUp, text: 'Mais conquistas' }, { icon: Heart, text: 'Mais você' }].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center justify-center gap-3 py-2 font-semibold text-[#0b2c5c]">
              <Icon className="h-7 w-7 shrink-0 text-prime-red" aria-hidden="true" /><span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

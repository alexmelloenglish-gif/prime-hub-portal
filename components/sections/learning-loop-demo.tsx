import { ArrowRight, Eye, MessageCircleMore, Target } from 'lucide-react'

const steps = [
  {
    step: '01',
    title: 'Você pratica',
    text: 'Usa o inglês em situações ligadas aos seus objetivos, com espaço para tentar, perguntar e receber orientação.',
    result: 'A aula produz sinais reais sobre a sua aprendizagem.',
    icon: MessageCircleMore,
  },
  {
    step: '02',
    title: 'Seu professor observa',
    text: 'Percebe o que já está funcionando, onde ainda há dificuldade e o que merece atenção.',
    result: 'O foco nasce do que aconteceu na prática.',
    icon: Eye,
  },
  {
    step: '03',
    title: 'O próximo foco fica claro',
    text: 'O professor escolhe a prioridade seguinte e cria uma nova oportunidade de prática.',
    result: 'A próxima aula começa mais bem informada.',
    icon: Target,
  },
]

export function LearningLoopDemo() {
  return (
    <section id="como-funciona" className="relative overflow-hidden border-y border-slate-200 bg-[#f7fafd] py-14 sm:py-18">
      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-prime-red">Como funciona</p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#0b2c5c] sm:text-4xl">
            O que acontece hoje ajuda a orientar o que vem depois.
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
            Em vez de apenas seguir uma sequência de conteúdo, a Prime usa o que aparece na prática para ajudar o professor a decidir o próximo foco.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {steps.map(({ step, title, text, result, icon: Icon }, index) => (
            <article key={step} className="relative flex h-full flex-col rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(14,43,82,0.06)] sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <span className="font-display text-3xl font-extrabold tracking-[-0.04em] text-[#d8e3ef]">{step}</span>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4fa]">
                  <Icon className="h-6 w-6 text-[#123263]" />
                </div>
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-[#0b2c5c]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
              <p className="mt-5 border-t border-slate-100 pt-4 text-sm font-semibold leading-6 text-[#244571]">{result}</p>
              {index < steps.length - 1 ? (
                <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 text-[#123263] lg:block" aria-hidden="true" />
              ) : null}
            </article>
          ))}
        </div>

        <div id="exemplo" className="mt-10 scroll-mt-24 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(14,43,82,0.07)]">
          <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
            <div className="bg-[#0b2c5c] p-7 text-white sm:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-200">Exemplo ilustrativo</p>
              <h3 className="mt-3 font-display text-2xl font-bold sm:text-3xl">Uma aula deixa uma pista. A próxima transforma essa pista em prática.</h3>
              <p className="mt-4 text-sm leading-6 text-blue-100 sm:text-base">
                Um exemplo simples de como o acompanhamento pode conectar duas aulas sem transformar o aprendizado em uma sequência automática.
              </p>
            </div>

            <div className="grid gap-0 divide-y divide-slate-200 p-6 sm:p-8">
              <div className="py-4 first:pt-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-prime-red">Você pratica</p>
                <p className="mt-2 text-base leading-7 text-slate-700">Você conta, em inglês, o que fez ontem.</p>
              </div>
              <div className="py-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-prime-red">O professor observa</p>
                <p className="mt-2 text-base leading-7 text-slate-700">A ideia fica clara, mas algumas formas do passado ainda precisam de apoio.</p>
              </div>
              <div className="py-4 last:pb-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-prime-red">O próximo foco</p>
                <p className="mt-2 text-base leading-7 text-slate-700">Na aula seguinte, você pratica o passado em uma nova situação e percebe o que já consegue fazer com mais autonomia.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

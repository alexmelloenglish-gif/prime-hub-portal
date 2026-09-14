import { ArrowRight, Eye, MessageCircleMore, Target } from 'lucide-react'

const steps = [
  {
    step: '01',
    title: 'Você pratica',
    text: 'Usa o inglês em atividades ligadas aos seus objetivos, com espaço para tentar, perguntar e receber orientação.',
    icon: MessageCircleMore,
  },
  {
    step: '02',
    title: 'Seu professor observa e interpreta',
    text: 'Percebe o que você já consegue fazer, onde ainda precisa de ajuda e o que merece atenção.',
    icon: Eye,
  },
  {
    step: '03',
    title: 'O próximo foco fica mais claro',
    text: 'O professor escolhe o que merece atenção na sequência e define uma nova oportunidade de prática.',
    icon: Target,
  },
]

export function LearningLoopDemo() {
  return (
    <section id="como-funciona" className="relative overflow-hidden border-y border-slate-200 bg-[#f7fafd] py-16 sm:py-20">
      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-prime-red">Continuidade</p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#0b2c5c] sm:text-4xl">
            O que acontece na sua aula ajuda a orientar o que vem depois.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg font-semibold leading-8 text-[#123263]">
            Cada aula ajuda a orientar a próxima.
          </p>
          <p className="mx-auto mt-3 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
            Uma aula é mais do que o conteúdo planejado. Suas falas, dúvidas, tentativas, erros e conquistas mostram pistas sobre o que você já consegue fazer e onde ainda precisa de ajuda.
          </p>
          <p className="mx-auto mt-3 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
            Na PRIME, essas pistas ajudam o professor a acompanhar seu momento, interpretar o que está mudando e decidir o que merece atenção a seguir.
          </p>
          <p className="mx-auto mt-5 max-w-3xl border-l-4 border-prime-red pl-4 text-left font-display text-xl font-bold italic leading-8 text-[#0b2c5c] sm:text-2xl">
            Sua próxima aula não esquece o que importa sobre a sua aprendizagem.
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-600">
            Assim, a próxima aula não parte apenas de onde o conteúdo parou. Ela considera também o que sua aprendizagem mostrou.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {steps.map(({ step, title, text, icon: Icon }, index) => (
            <article key={step} className="relative rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(14,43,82,0.06)] sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-bold tracking-[0.18em] text-[#7890ab]">{step}</span>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4fa]">
                  <Icon className="h-6 w-6 text-[#123263]" />
                </div>
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-[#0b2c5c]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
              {index < steps.length - 1 ? (
                <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 text-[#123263] lg:block" aria-hidden="true" />
              ) : null}
            </article>
          ))}
        </div>

        <div id="exemplo" className="mt-12 scroll-mt-24 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(14,43,82,0.07)]">
          <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
            <div className="bg-[#0b2c5c] p-7 text-white sm:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-200">Exemplo ilustrativo</p>
              <h3 className="mt-3 font-display text-2xl font-bold sm:text-3xl">Veja como uma aula pode orientar a próxima.</h3>
              <p className="mt-4 text-sm leading-6 text-blue-100 sm:text-base">
                O exemplo abaixo demonstra o mesmo modelo de três passos. Ele não é apresentado como caso real de aluno.
              </p>
            </div>

            <div className="grid gap-0 divide-y divide-slate-200 p-6 sm:p-8">
              <div className="py-4 first:pt-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-prime-red">Você pratica</p>
                <p className="mt-2 text-base leading-7 text-slate-700">Você conta, em inglês, o que fez ontem.</p>
              </div>
              <div className="py-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-prime-red">Seu professor observa e interpreta</p>
                <p className="mt-2 text-base leading-7 text-slate-700">Você consegue comunicar a ideia, mas ainda precisa de ajuda para usar corretamente algumas formas do passado.</p>
              </div>
              <div className="py-4 last:pb-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-prime-red">O próximo foco fica mais claro</p>
                <p className="mt-2 text-base leading-7 text-slate-700">Na próxima aula, o professor propõe uma nova situação para você praticar o passado e observa novamente como você produz.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

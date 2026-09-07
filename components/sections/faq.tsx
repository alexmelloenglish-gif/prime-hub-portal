const questions = [
  {
    question: 'Para quem é a Prime Digital Hub?',
    answer: 'Para pessoas que querem usar o inglês em objetivos reais e preferem uma aprendizagem acompanhada por professor, com contexto entre os encontros e direção clara sobre o que praticar a seguir.',
  },
  {
    question: 'O que acontece na aula experimental?',
    answer: 'Você conversa sobre seus objetivos e conhece a proposta de acompanhamento da Prime. A aula é o primeiro passo para entender se esse formato faz sentido para o seu momento.',
  },
  {
    question: 'A tecnologia substitui o professor?',
    answer: 'Não. O professor continua sendo a autoridade pedagógica. A tecnologia trabalha nos bastidores para organizar contexto, evidências e continuidade.',
  },
  {
    question: 'Como a Prime acompanha minha evolução?',
    answer: 'O acompanhamento conecta o que foi trabalhado, observado e direcionado em cada encontro. Assim, a próxima aula pode construir sobre o que já foi desenvolvido.',
  },
  {
    question: 'Preciso saber meu nível antes de começar?',
    answer: 'Não. Você pode começar compartilhando seus objetivos, sua rotina e as situações em que deseja usar o inglês. O professor ajuda a organizar o próximo passo.',
  },
]

export function FAQSection() {
  return (
    <section id="duvidas" className="bg-[#f7fafd] py-20 sm:py-24">
      <div className="container grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <div className="lg:sticky lg:top-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-prime-red">Antes de começar</p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#0b2c5c] sm:text-4xl">Clareza para dar o próximo passo.</h2>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-600">Se ainda ficou alguma dúvida, encontre aqui as respostas mais importantes sobre a experiência PRIME.</p>
          <a href="https://calendar.app.google/z1N7yrhvrVr6WyfFA" target="_blank" rel="noreferrer" className="mt-7 inline-flex min-h-12 items-center rounded-full bg-prime-red px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(168,34,23,0.2)] transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-prime-red focus-visible:ring-offset-2">Agendar aula experimental</a>
        </div>

        <div className="divide-y divide-slate-200 rounded-[1.7rem] border border-slate-200 bg-white px-6 shadow-[0_18px_50px_rgba(14,43,82,0.06)] sm:px-8">
          {questions.map(({ question, answer }) => (
            <details key={question} className="group py-5 first:pt-2 last:pb-2">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-3 font-display text-lg font-bold text-[#0b2c5c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-prime-red [&::-webkit-details-marker]:hidden">
                {question}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef4fa] text-xl font-normal text-[#123263] transition group-open:rotate-45">+</span>
              </summary>
              <p className="max-w-2xl pb-3 pr-12 text-sm leading-6 text-slate-600">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

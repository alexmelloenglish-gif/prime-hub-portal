const questions = [
  {
    question: 'As aulas são online?',
    answer: 'Sim. As aulas são ao vivo e online, com interação em tempo real com o professor.',
  },
  {
    question: 'Preciso saber meu nível para começar?',
    answer: 'Não. Conte sobre seus objetivos e sobre as situações em que deseja usar o inglês. O professor ajuda a identificar seu ponto de partida.',
  },
  {
    question: 'O que acontece na aula experimental?',
    answer: 'Você conhece o acompanhamento da Prime, conversa sobre seus objetivos e compartilha suas dúvidas. É uma oportunidade para entender se a experiência faz sentido para você.',
  },
  {
    question: 'Como acompanho meu aprendizado?',
    answer: 'O professor ajuda você a reconhecer o que conseguiu fazer, o que ainda precisa de prática e qual será o próximo foco.',
  },
  {
    question: 'Como faço o agendamento?',
    answer: 'Escolha um horário disponível na agenda online. Após a confirmação, você recebe as informações do encontro. Se precisar de ajuda, fale com a Prime pelo WhatsApp.',
  },
  {
    question: 'Como conheço os planos e valores?',
    answer: 'Fale com a Prime para conhecer as opções e esclarecer suas dúvidas sobre frequência, horários e valores.',
  },
]

export function FAQSection() {
  return (
    <section id="duvidas" className="bg-[#f7fafd] py-16 sm:py-20">
      <div className="container grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <div className="lg:sticky lg:top-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-prime-red">Dúvidas frequentes</p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#0b2c5c] sm:text-4xl">O que você precisa saber para começar.</h2>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
            Informações práticas sobre formato, ponto de partida, acompanhamento e agendamento.
          </p>
          <a
            href="https://calendar.app.google/z1N7yrhvrVr6WyfFA"
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex min-h-12 items-center rounded-full bg-[#1565D8] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(21,101,216,0.2)] transition hover:bg-[#0f56bd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1565D8] focus-visible:ring-offset-2"
          >
            Agendar aula experimental grátis
          </a>
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

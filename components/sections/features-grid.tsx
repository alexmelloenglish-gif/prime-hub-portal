import { GraduationCap, MessageCircleQuestion, Target } from 'lucide-react'

const teacherPoints = [
  {
    icon: MessageCircleQuestion,
    title: 'Espaço para tentar e perguntar',
    text: 'Você pode testar o inglês, tirar dúvidas, receber correções e tentar novamente sem transformar cada erro em um julgamento.',
  },
  {
    icon: GraduationCap,
    title: 'Interpretação do professor',
    text: 'O professor observa o que aconteceu na prática, considera seus objetivos e decide o que aquela evidência significa para o seu aprendizado.',
  },
  {
    icon: Target,
    title: 'Direção com propósito',
    text: 'O próximo foco é escolhido para responder ao que você precisa desenvolver — não apenas para avançar páginas ou cumprir uma sequência automática.',
  },
]

export function FeaturesGrid() {
  return (
    <section id="professor" className="relative z-10 bg-white py-16 sm:py-20">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-prime-red">Acompanhamento docente</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#0b2c5c] md:text-4xl">
              Um professor que acompanha o seu caminho.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Seus objetivos, dúvidas e experiências fazem parte da aula. O professor orienta a prática, oferece correções e decide com você como avançar.
            </p>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Você entende melhor o que conseguiu fazer, onde ainda precisa de prática e por que determinado foco vem a seguir.
            </p>
          </div>

          <div className="grid gap-4">
            {teacherPoints.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-[#f9fbfd] p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef4fa]">
                    <Icon className="h-6 w-6 text-[#123263]" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#0b2c5c]">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

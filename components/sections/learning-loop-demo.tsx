import { ArrowRight, CheckCircle2, MessageSquareText, Target, TrendingUp } from 'lucide-react'

const journey = [
  { step: '01', label: 'O professor observa', text: 'A aula deixa evidências sobre o que você consegue fazer, explicar e praticar.', icon: MessageSquareText },
  { step: '02', label: 'O contexto permanece', text: 'O que importa fica organizado para que a próxima conversa não comece do zero.', icon: TrendingUp },
  { step: '03', label: 'O próximo foco aparece', text: 'Você entende o que praticar agora e por que isso importa para o seu objetivo.', icon: Target },
]

export function LearningLoopDemo() {
  return (
    <section id="prova-do-metodo" className="relative overflow-hidden bg-[#0b2c5c] py-20 text-white sm:py-24">
      <div className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-[#1b5da8]/40 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-prime-red/20 blur-3xl" aria-hidden="true" />
      <div className="container relative z-10">
        <div className="mb-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-red-200">Por dentro do método</p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Não é apenas uma aula. É um ciclo que continua.</h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
            Este é um exemplo real de como uma aula da Prime é acompanhada. O professor conduz a conversa, interpreta as evidências e define o próximo passo. A tecnologia amplia esse trabalho, guarda a memória e nos assiste na preparação da aula seguinte.
          </p>
          <p className="mt-5 max-w-2xl font-display text-xl font-bold leading-8 text-white sm:text-2xl">
            O aprendizado não acaba quando a aula termina, ele está apenas começando.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[2rem] border border-white/15 bg-white/[0.08] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur sm:p-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">Aula real · Caso anonimizado</p>
                <h3 className="mt-2 font-display text-2xl font-bold">Preparação para uma entrevista de trabalho</h3>
              </div>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">Acompanhamento do professor</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-4 text-[#0b2c5c] sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Situação da aula</p>
                <p className="mt-3 font-display text-xl font-bold">Como falar sobre quem sou e o que já fiz.</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">O aluno se preparou para explicar sua formação e sua experiência em embarcações.</p>
              </div>
              <div className="rounded-2xl bg-[#eaf2fb] p-4 text-[#0b2c5c]">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Próximo foco</p>
                <p className="mt-3 font-display text-lg font-bold">Organizar melhor as respostas</p>
                <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-[#24558b]"><CheckCircle2 className="h-4 w-4" /> Direção do professor</div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-[#071f44] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">Evidências da aula</p>
                <span className="text-xs text-blue-200">Registro real · sem identificação</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-blue-50">O aluno explicou sua formação, falou sobre sua experiência a bordo e descreveu o tipo de oportunidade que procura.</p>
              <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2">
                <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-200">O que funcionou</p><p className="mt-2 text-sm leading-6 text-blue-50">Ele conseguiu falar melhor quando o assunto fazia parte da sua experiência.</p></div>
                <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-200">O que vem depois</p><p className="mt-2 text-sm leading-6 text-blue-50">Usar uma estrutura simples para responder com mais clareza e segurança.</p></div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {journey.map(({ step, label, text, icon: Icon }, index) => (
              <div key={step} className="relative rounded-2xl border border-white/12 bg-white/[0.07] p-5 transition hover:-translate-y-0.5 hover:bg-white/[0.11] sm:p-6">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-black text-[#0b2c5c]">{step}</div>
                  <div>
                    <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-red-200" /><h3 className="font-display text-lg font-bold">{label}</h3></div>
                    <p className="mt-2 text-sm leading-6 text-blue-100">{text}</p>
                  </div>
                </div>
                {index < journey.length - 1 ? <ArrowRight className="absolute -bottom-3 left-8 hidden h-5 w-5 rotate-90 text-red-200 lg:block" aria-hidden="true" /> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

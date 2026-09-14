import { ArrowRight, CalendarCheck, Eye, GraduationCap, MessageCircle, Target } from 'lucide-react'
import { BrandLogo } from '@/components/layout/brand-logo'

export const metadata = {
  title: 'PRIME Phase 1 Preview',
  robots: {
    index: false,
    follow: false,
  },
}

const bookingHref = 'https://calendar.app.google/z1N7yrhvrVr6WyfFA'
const whatsappHref =
  'https://api.whatsapp.com/send/?phone=5521965147515&text=Oi%21+Gostaria+de%20falar%20com%20a%20Prime%20Digital%20Hub.&type=phone_number&app_absent=0'

export default function Phase1PreviewPage() {
  return (
    <main className="min-h-screen bg-white text-[#0b2c5c]">
      <header className="border-b border-slate-200 bg-white">
        <div className="container flex items-center justify-between gap-4 py-4">
          <BrandLogo variant="full" className="h-[72px] w-[164px] border-0 bg-transparent p-0 shadow-none" />
          <div className="flex items-center gap-2">
            <a href="/login" className="rounded-full border border-[#123263]/20 px-4 py-2 text-sm font-semibold text-[#123263]">Portal do aluno</a>
            <a href={bookingHref} target="_blank" rel="noreferrer" className="hidden rounded-full bg-[#1565D8] px-5 py-2 text-sm font-semibold text-white md:inline-flex">Agendar aula experimental grátis</a>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-white">
        <div className="container grid items-center gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#244571]">Prime Digital Hub · Aulas online ao vivo</p>
            <h1 className="max-w-3xl font-display text-[2.5rem] font-extrabold leading-[0.98] tracking-[-0.035em] text-[#0b2c5c] sm:text-5xl lg:text-[4rem]">Aulas de inglês online ao vivo para objetivos reais.</h1>
            <div className="mt-5 h-1.5 w-28 rounded-full bg-prime-red" />
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">Pratique o inglês para a escola, o trabalho ou o dia a dia, com atenção do professor ao que você já consegue fazer e ao que precisa desenvolver.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href={bookingHref} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#1565D8] px-6 py-3 text-base font-semibold text-white shadow-[0_18px_42px_rgba(21,101,216,0.22)]">
                <CalendarCheck className="mr-2 h-5 w-5" />Agendar aula experimental grátis
              </a>
              <a href="#como-funciona" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#123263]/20 bg-white px-6 py-3 text-base font-semibold text-[#123263]">Como funciona</a>
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#118640] px-6 py-3 text-base font-semibold text-white">
                <MessageCircle className="mr-2 h-5 w-5" />Falar com a Prime
              </a>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">Conte sobre seus objetivos e conheça o acompanhamento da Prime. Você não precisa saber seu nível antes de começar.</p>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(14,43,82,0.12)]">
              <img src="/assets/prime-hero-student-hq.webp" alt="Aluna estudando inglês online no Prime Digital Hub" width={958} height={860} className="h-auto w-full" />
              <div className="border-t border-slate-100 px-5 py-4 text-center">
                <p className="font-display text-xl font-bold">Better English, Brighter Future.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="bg-[#f7fafd] py-16 sm:py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-prime-red">Continuidade</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#0b2c5c] sm:text-4xl">O que acontece na sua aula ajuda a orientar o que vem depois.</h2>
            <p className="mt-5 text-xl font-semibold text-[#123263]">Cada aula ajuda a orientar a próxima.</p>
            <p className="mt-3 font-display text-xl font-bold italic text-[#0b2c5c]">Sua próxima aula não esquece o que importa sobre a sua aprendizagem.</p>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-600">Uma aula é mais do que o conteúdo planejado. Suas falas, dúvidas, tentativas, erros e conquistas mostram pistas sobre o que você já consegue fazer e onde ainda precisa de ajuda.</p>
            <p className="mx-auto mt-3 max-w-3xl text-base leading-7 text-slate-600">Na PRIME, essas pistas ajudam o professor a acompanhar seu momento, interpretar o que está mudando e decidir o que merece atenção a seguir.</p>
            <p className="mx-auto mt-3 max-w-3xl text-base leading-7 text-slate-600">Assim, a próxima aula não parte apenas de onde o conteúdo parou. Ela considera também o que sua aprendizagem mostrou.</p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_34px_rgba(14,43,82,0.05)]">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef4fa]"><ArrowRight className="h-5 w-5" /></div>
              <h3 className="font-display text-xl font-bold">Você pratica</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">Usa o inglês em atividades ligadas aos seus objetivos, com espaço para tentar, perguntar e receber orientação.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_34px_rgba(14,43,82,0.05)]">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef4fa]"><Eye className="h-5 w-5" /></div>
              <h3 className="font-display text-xl font-bold">Seu professor observa e interpreta</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">Percebe o que você consegue fazer, onde ainda precisa de apoio e o que merece atenção.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_34px_rgba(14,43,82,0.05)]">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef4fa]"><Target className="h-5 w-5" /></div>
              <h3 className="font-display text-xl font-bold">O próximo foco fica mais claro</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">O professor escolhe o que merece atenção na sequência a partir do que aconteceu na aula.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="exemplo" className="bg-[#0b2c5c] py-16 text-white sm:py-20">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-red-200">Exemplo ilustrativo</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Veja como uma aula ajuda a orientar a próxima.</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">Você pratica</p><p className="mt-3 text-base leading-7 text-blue-50">Conta, em inglês, o que fez ontem.</p></div>
              <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">Seu professor observa e interpreta</p><p className="mt-3 text-base leading-7 text-blue-50">Você comunica a ideia, mas ainda precisa de ajuda para usar corretamente algumas formas do passado.</p></div>
              <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">O próximo foco fica mais claro</p><p className="mt-3 text-base leading-7 text-blue-50">Na próxima aula, o professor propõe uma nova situação para você praticar o passado e observa novamente como você produz.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="professor" className="bg-white py-16 sm:py-20">
        <div className="container grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-prime-red">Acompanhamento docente</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Um professor que acompanha o seu caminho.</h2>
          </div>
          <div className="rounded-[1.7rem] border border-slate-200 bg-[#f7fafd] p-7 shadow-[0_18px_50px_rgba(14,43,82,0.06)]">
            <div className="flex items-start gap-4"><GraduationCap className="mt-1 h-6 w-6 shrink-0 text-[#123263]" /><div><p className="text-base leading-7 text-slate-600">Seus objetivos, dúvidas e experiências fazem parte da aula. O professor orienta a prática, oferece correções e decide com você como avançar.</p><p className="mt-3 text-base leading-7 text-slate-600">Você pode perguntar, tentar de novo e entender o motivo de cada próximo passo.</p></div></div>
          </div>
        </div>
      </section>

      <section id="duvidas" className="bg-[#f7fafd] py-16 sm:py-20">
        <div className="container grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-prime-red">Antes de começar</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Clareza para dar o próximo passo.</h2>
          </div>
          <div className="divide-y divide-slate-200 rounded-[1.7rem] border border-slate-200 bg-white px-6 shadow-[0_18px_50px_rgba(14,43,82,0.06)]">
            <details className="py-5"><summary className="cursor-pointer font-display text-lg font-bold">As aulas são online?</summary><p className="mt-3 text-sm leading-6 text-slate-600">Sim. As aulas são ao vivo e online, com interação em tempo real com o professor.</p></details>
            <details className="py-5"><summary className="cursor-pointer font-display text-lg font-bold">Preciso saber meu nível para começar?</summary><p className="mt-3 text-sm leading-6 text-slate-600">Não. Conte sobre seus objetivos e sobre as situações em que deseja usar o inglês. O professor ajuda a identificar seu ponto de partida.</p></details>
            <details className="py-5"><summary className="cursor-pointer font-display text-lg font-bold">O que acontece na aula experimental?</summary><p className="mt-3 text-sm leading-6 text-slate-600">Você conhece o acompanhamento da Prime, conversa sobre seus objetivos e compartilha suas dúvidas. É uma oportunidade para entender se a experiência faz sentido para você.</p></details>
            <details className="py-5"><summary className="cursor-pointer font-display text-lg font-bold">Como acompanho meu aprendizado?</summary><p className="mt-3 text-sm leading-6 text-slate-600">O professor ajuda você a reconhecer o que conseguiu fazer, o que ainda precisa de prática e qual será o próximo foco.</p></details>
            <details className="py-5"><summary className="cursor-pointer font-display text-lg font-bold">Como conheço os planos e valores?</summary><p className="mt-3 text-sm leading-6 text-slate-600">Fale com a Prime para conhecer as opções e esclarecer suas dúvidas sobre frequência, horários e valores.</p></details>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="container overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#f9fbfe_0%,#ffffff_52%,#fff6f6_100%)] shadow-[0_26px_70px_rgba(14,43,82,0.08)]">
          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">Seu próximo passo no inglês começa com uma conversa.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">Conte o que você quer conseguir com o inglês e conheça o acompanhamento da Prime.</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href={bookingHref} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#1565D8] px-6 py-3 text-base font-semibold text-white"><CalendarCheck className="mr-2 h-5 w-5" />Agendar aula experimental grátis</a>
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#118640] px-6 py-3 text-base font-semibold text-white"><MessageCircle className="mr-2 h-5 w-5" />Falar com a Prime no WhatsApp</a>
              </div>
            </div>
            <img src="/assets/prime-cta-community-hq.webp" alt="Comunidade de alunos aprendendo no Prime Digital Hub" width={900} height={440} className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="container flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-[#123263]">PRIME DIGITAL HUB · Aulas de inglês online ao vivo.</p>
          <p>© 2026 Prime Digital Hub. Todos os direitos reservados.</p>
        </div>
      </footer>
    </main>
  )
}

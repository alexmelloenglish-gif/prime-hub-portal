'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ChevronLeft, Save, Sparkles, Star } from 'lucide-react'

type Rating = 'VERY_WELL' | 'WITH_HELP' | 'STUDY_MORE'

const ITEMS = [
  { id: 'past-story', challenge: 'Consigo falar sobre mim e contar o que fiz no passado.', example: 'Yesterday, I went to school. I played football with my friends.' },
  { id: 'past-negative', challenge: 'Consigo dizer coisas que eu não fiz no passado.', example: "I didn't go to the cinema. I didn't play volleyball." },
  { id: 'past-question', challenge: 'Consigo fazer uma pergunta sobre o passado.', example: 'Did you play football yesterday?' },
  { id: 'past-answer', challenge: 'Consigo responder a uma pergunta sobre o passado.', example: "Did you play football? — Yes, I did. / No, I didn't." },
  { id: 'now-past', challenge: 'Consigo perceber se uma pergunta é sobre agora ou sobre o passado.', example: 'Do you play football? / Did you play football yesterday?' },
  { id: 'past-words', challenge: 'Consigo lembrar e usar algumas palavras que mudam quando falo sobre o passado.', example: 'go → went • drink → drank • ride → rode • swim → swam' },
  { id: 'advice', challenge: 'Consigo dar um conselho para alguém.', example: "You should rest. You should go to the doctor. You shouldn't eat too much candy." },
  { id: 'health', challenge: 'Consigo dizer como eu ou outra pessoa está se sentindo quando não está bem.', example: 'I have a headache. She has a cough. He has a stomach ache.' },
  { id: 'reflexive', challenge: 'Consigo falar sobre uma ação que uma pessoa faz com ela mesma.', helper: 'Quando quem faz e quem recebe a ação são a mesma pessoa, usamos palavras como myself, yourself, himself e herself.', example: 'I burnt myself. She looked at herself. I did it myself.' },
  { id: 'superlative', challenge: 'Consigo dizer que alguma coisa é a maior, a melhor ou a mais entre todas.', helper: 'Com palavras menores, normalmente mudamos o final; com palavras maiores, usamos the most.', example: 'the hottest • the biggest • the best • the most interesting' },
  { id: 'nutrients', challenge: 'Consigo falar sobre alimentos e explicar para que alguns nutrientes servem.', example: 'Carbohydrates give us energy. Proteins help us grow.' },
  { id: 'digestion', challenge: 'Consigo falar sobre algumas partes da digestão e explicar o que elas fazem.', example: 'The large intestine absorbs water.' },
  { id: 'self-correction', challenge: 'Consigo perceber quando falo algo que precisa ser corrigido e tentar novamente.', example: "I don't... → No, I didn't. / Did you rode...? → Did you ride...?" },
] as const

const OPTIONS: Array<{ value: Rating; title: string; pt: string; emoji: string; box: string }> = [
  { value: 'VERY_WELL', title: 'I CAN DO IT VERY WELL!', pt: 'Eu consigo fazer isso muito bem!', emoji: '💪😎', box: 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100' },
  { value: 'WITH_HELP', title: 'I CAN TRY WITH HELP!', pt: 'Eu consigo tentar com ajuda!', emoji: '🤝🙂', box: 'border-amber-300 bg-amber-50 hover:bg-amber-100' },
  { value: 'STUDY_MORE', title: 'I NEED TO STUDY MORE!', pt: 'Eu preciso estudar ou praticar mais!', emoji: '🤓📚', box: 'border-rose-300 bg-rose-50 hover:bg-rose-100' },
]

export function GustavoJourneyCheckIn() {
  const [answers, setAnswers] = useState<Record<string, Rating>>({})
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const completed = Object.keys(answers).length
  const allDone = completed === ITEMS.length

  const progress = useMemo(() => Math.round((completed / ITEMS.length) * 100), [completed])

  async function submit() {
    if (!allDone || status === 'saving') return
    setStatus('saving')
    try {
      const response = await fetch('/api/journey/gustavo/check-in', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          journeyKey: '7q4m9',
          studentId: 'stu_4c4da6c04ac4',
          answers,
        }),
      })
      if (!response.ok) throw new Error('save_failed')
      setStatus('saved')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'saved') {
    return (
      <main className="min-h-screen bg-[#f7fbff] px-4 py-10 text-[#0b2c5c]">
        <div className="mx-auto max-w-2xl rounded-[36px] border border-emerald-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-700" />
          </div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-emerald-700">SAVED!</p>
          <h1 className="mt-2 text-4xl font-black">Mandou muito bem, Gustavo! 🎉</h1>
          <p className="mt-4 text-base leading-7 text-slate-700">
            Suas respostas ficaram salvas no Prime. Você não precisa mandar arquivo nenhum.
            Na próxima aula, podemos comparar o que você acha com o que aparece quando você tenta de verdade.
          </p>
          <Link href="/journey/gustavo-5-lessons-7q4m9" className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-[#0b2c5c] px-6 py-3 text-sm font-black text-white">
            <ChevronLeft className="h-4 w-4" />
            VOLTAR PARA MINHA JORNADA
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f7fbff] text-[#0b2c5c]">
      <header className="sticky top-0 z-20 border-b border-blue-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/journey/gustavo-5-lessons-7q4m9" className="flex items-center gap-2 text-xs font-black text-[#0057b8]">
            <ChevronLeft className="h-4 w-4" />
            MY JOURNEY
          </Link>
          <img src="/brand/prime-digital-hub-full-transparent.png" alt="Prime Digital Hub" className="h-auto w-32 sm:w-40" />
          <span className="text-xs font-black">{completed}/{ITEMS.length}</span>
        </div>
        <div className="h-2 bg-slate-100">
          <div className="h-full bg-gradient-to-r from-[#0057b8] to-[#e60023] transition-all" style={{ width: progress + '%' }} />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <section className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-[#0b2c5c] via-[#0c3977] to-[#0057b8] p-6 text-white shadow-xl sm:p-8">
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-center gap-2 text-yellow-300">
              <Star className="h-5 w-5 fill-yellow-300" />
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-blue-200">MY ENGLISH JOURNEY CHECK-IN</p>
            <h1 className="mt-2 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
              Sobre as coisas que estudamos nestas 5 aulas, como você acha que se sairia hoje?
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-50 sm:text-base">
              Não é prova. Não existe resposta certa ou errada. Veja cada desafio, leia o exemplo em inglês e marque a opção que mais combina com você hoje.
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-3 md:grid-cols-3">
          {OPTIONS.map((option) => (
            <div key={option.value} className={'rounded-[24px] border p-4 ' + option.box}>
              <div className="text-3xl">{option.emoji}</div>
              <p className="mt-2 text-sm font-black">{option.title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">{option.pt}</p>
            </div>
          ))}
        </section>

        <section className="mt-7 space-y-4">
          {ITEMS.map((item, index) => (
            <article key={item.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-5 lg:grid-cols-[1fr_.9fr]">
                <div>
                  <div className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0b2c5c] text-sm font-black text-white">{index + 1}</span>
                    <div>
                      <h2 className="text-lg font-black leading-6">{item.challenge}</h2>
                      {'helper' in item && item.helper ? <p className="mt-2 text-xs leading-5 text-slate-500">{item.helper}</p> : null}
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl bg-blue-50 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#0057b8]">EXAMPLE</p>
                    <p className="mt-1 text-sm font-bold italic leading-6 text-[#0057b8]">{item.example}</p>
                  </div>
                </div>

                <div className="grid gap-2">
                  {OPTIONS.map((option) => {
                    const selected = answers[item.id] === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setAnswers((current) => ({ ...current, [item.id]: option.value }))
                          setStatus('idle')
                        }}
                        className={
                          'flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition ' +
                          (selected ? 'border-[#0b2c5c] bg-[#eef7ff] shadow-sm' : 'border-slate-200 bg-white hover:border-blue-300')
                        }
                      >
                        <span className="text-2xl">{option.emoji}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-black">{option.title}</span>
                          <span className="mt-0.5 block text-[11px] text-slate-500">{option.pt}</span>
                        </span>
                        <span className={'h-6 w-6 rounded-full border-2 ' + (selected ? 'border-[#0b2c5c] bg-[#0b2c5c] ring-4 ring-blue-100' : 'border-slate-300')} />
                      </button>
                    )
                  })}
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-7 rounded-[30px] border border-yellow-300 bg-yellow-50 p-6 text-center">
          <p className="text-sm font-black">{allDone ? 'Você respondeu todos os desafios! 🎉' : 'Faltam ' + (ITEMS.length - completed) + ' desafios.'}</p>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            Quando terminar, clique em salvar. Suas respostas vão direto para o Prime — ninguém precisa mandar o arquivo de volta.
          </p>
          <button
            type="button"
            disabled={!allDone || status === 'saving'}
            onClick={submit}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#e60023] px-7 py-4 text-sm font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save className="h-4 w-4" />
            {status === 'saving' ? 'SALVANDO...' : 'SALVAR MINHAS RESPOSTAS'}
          </button>
          {status === 'error' ? (
            <p className="mt-3 text-xs font-bold text-red-700">Não conseguimos salvar agora. Tente novamente em alguns segundos.</p>
          ) : null}
        </section>
      </div>
    </main>
  )
}

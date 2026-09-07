const comparisonBlockImage = '/assets/comparison-block-approved.png'

export function ComparisonApprovedSection() {
  return (
    <section id="comparativo" className="relative overflow-hidden border-y border-slate-200 bg-[#fbfcfe] py-10 sm:py-16">
      <div className="container min-w-0">
        <figure className="mx-auto max-w-[1536px] overflow-hidden rounded-[1.75rem] bg-white shadow-[0_18px_54px_rgba(14,43,82,0.10)]">
          <img
            src={comparisonBlockImage}
            alt="Comparativo entre outros métodos e a experiência PRIME: esforço e menor resultado de um lado; clareza, progresso e confiança com a PRIME do outro."
            width={1536}
            height={1024}
            className="block h-auto w-full"
          />
          <figcaption className="sr-only">
            Comparação visual: em outros métodos, aulas genéricas, foco em regras, pouca prática e resultados demorados; com a PRIME, aulas personalizadas, inglês aplicado à vida, suporte de professores, mais confiança e resultados percebidos na prática. Abaixo, a composição destaca mais oportunidades, mais confiança, mais conexões, mais liberdade e um futuro mais brilhante.
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

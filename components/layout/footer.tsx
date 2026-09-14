import Link from 'next/link'
import { BrandLogo } from './brand-logo'

interface FooterProps {
  portalHref: string
}

const whatsappHref =
  'https://api.whatsapp.com/send/?phone=5521965147515&text=Oi%21+Gostaria+de%20falar%20com%20a%20Prime%20Digital%20Hub.&type=phone_number&app_absent=0'

export function Footer({ portalHref }: FooterProps) {
  return (
    <footer className="relative z-10 border-t border-slate-200 bg-white py-8">
      <div className="container">
        <div className="grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div className="flex items-center">
            <BrandLogo variant="full" className="h-[78px] w-[174px] border-0 bg-transparent p-0 shadow-none" />
          </div>

          <div className="text-sm text-slate-500 md:text-center">
            <p className="font-semibold text-[#123263]">Aulas de inglês online ao vivo.</p>
            <p className="mt-1">© 2026 Prime Digital Hub. Todos os direitos reservados.</p>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-[#123263] md:justify-end">
            <Link href={portalHref} className="hover:text-prime-red">Portal do aluno</Link>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="hover:text-prime-red">Falar com a Prime</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

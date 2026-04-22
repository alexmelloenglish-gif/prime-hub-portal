# Prime Digital Hub

Aplicação Next.js pronta para produção, com autenticação Google via NextAuth, dashboard protegido e base preparada para evolução SaaS.

## O que foi ajustado

- Autenticação simplificada para Google OAuth only
- Proteção de todas as rotas `/dashboard` com middleware e validação no servidor
- Dashboard reorganizado com páginas reais para visão geral, aulas, progresso, metas, conversação e configurações
- Schema Prisma reduzido para modelos úteis ao produto atual
- Configuração de segurança reforçada no Next.js
- Dependências e documentação limpas para deploy no Vercel

## Stack

- Next.js 15
- TypeScript
- Tailwind CSS 3
- NextAuth v4
- Prisma
- PostgreSQL
- Recharts

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```env
DATABASE_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

## Desenvolvimento local

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Google OAuth

No Google Cloud Console, configure:

- Authorized JavaScript origin: `http://localhost:3000`
- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

Para produção, adicione também a URL final do Vercel:

- `https://seu-dominio.vercel.app`
- `https://seu-dominio.vercel.app/api/auth/callback/google`

## Deploy na Vercel

1. Importe este repositório na Vercel.
2. Configure as variáveis de ambiente do projeto.
3. Garanta que o banco PostgreSQL esteja acessível em produção.
4. Rode o primeiro `prisma db push` contra o banco alvo.

## Observações

- `vercel.json` não é necessário para este projeto no estado atual.
- O login só funciona com credenciais Google válidas.
- O `prisma db push` depende de um PostgreSQL real configurado em `DATABASE_URL`.

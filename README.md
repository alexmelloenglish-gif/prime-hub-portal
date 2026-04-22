# Prime Digital Hub - Portal Educacional

Um portal SaaS profissional e escalável para gerenciamento de aprendizado de idiomas, construído com Next.js 15, TypeScript, Tailwind CSS, Prisma e NextAuth.

## 🎯 Características

- **Landing Page Responsiva**: Hero section, features, comparação e CTA
- **Autenticação Segura**: Google OAuth e Email Magic Links com NextAuth
- **Dashboard Completo**: Sidebar, topbar, KPI cards e gráficos
- **Design Moderno**: Tema dark com cores Prime (Azul Marinho, Vermelho, Creme)
- **Banco de Dados**: Prisma + PostgreSQL com schema completo
- **Componentes Reutilizáveis**: Arquitetura escalável e maintível
- **TypeScript**: Type-safe em todo o projeto
- **Tailwind CSS 4**: Estilos modernos e responsivos

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework com App Router
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first CSS
- **Lucide React** - Ícones
- **Framer Motion** - Animações
- **Recharts** - Gráficos e visualizações

### Backend
- **Next.js API Routes** - Backend integrado
- **NextAuth v4** - Autenticação e autorização
- **Prisma ORM** - Database management
- **PostgreSQL** - Banco de dados

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- PostgreSQL 12+
- Conta Google para OAuth (opcional)

## 🚀 Instalação e Setup

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/prime-digital-hub.git
cd prime-digital-hub
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/prime_hub"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (para magic links)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="seu-email@gmail.com"
EMAIL_SERVER_PASSWORD="sua-senha-app"
EMAIL_FROM="noreply@primedigitalhub.com"
```

### 4. Configure o banco de dados

```bash
# Crie o banco de dados
npx prisma db push

# (Opcional) Abra o Prisma Studio para gerenciar dados
npx prisma studio
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📁 Estrutura do Projeto

```
prime-digital-hub/
├── app/
│   ├── api/
│   │   └── auth/[...nextauth]/    # Autenticação NextAuth
│   ├── dashboard/                  # Páginas do dashboard
│   ├── login/                       # Página de login
│   ├── layout.tsx                   # Layout raiz
│   ├── page.tsx                     # Landing page
│   └── globals.css                  # Estilos globais
├── components/
│   ├── dashboard/                   # Componentes do dashboard
│   ├── layout/                      # Componentes de layout
│   ├── sections/                    # Seções da landing page
│   └── ui/                          # Componentes UI reutilizáveis
├── lib/
│   ├── prisma.ts                    # Instância do Prisma
│   └── utils.ts                     # Funções utilitárias
├── prisma/
│   └── schema.prisma                # Schema do banco de dados
├── public/                          # Arquivos estáticos
├── .env.example                     # Variáveis de ambiente exemplo
├── next.config.js                   # Configuração Next.js
├── tailwind.config.ts               # Configuração Tailwind
└── tsconfig.json                    # Configuração TypeScript
```

## 🔐 Autenticação

### Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto
3. Ative a API Google+
4. Crie credenciais OAuth 2.0
5. Configure as URIs autorizadas:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://seu-dominio.com/api/auth/callback/google`
6. Copie Client ID e Secret para `.env.local`

### Email Magic Links

Configure um serviço de email (Gmail, SendGrid, etc.) para enviar links de acesso por email.

## 📊 Banco de Dados

O schema inclui:

- **Users**: Usuários com roles (student, teacher, admin)
- **Courses**: Cursos de idiomas
- **Lessons**: Aulas dentro dos cursos
- **Progress**: Acompanhamento de progresso do aluno
- **Feedback**: Feedback dos alunos
- **Attendance**: Registro de presença

## 🎨 Customização

### Cores

Edite `tailwind.config.ts` para mudar as cores:

```ts
colors: {
  'prime-dark': '#000c26',
  'prime-red': '#a82217',
  'prime-cream': '#f6ebcf',
}
```

### Tipografia

As fontes estão configuradas em `app/layout.tsx`:

```tsx
const poppins = Poppins({ weight: ['400', '600', '700', '800'] })
const inter = Inter({ subsets: ['latin'] })
```

## 🚢 Deployment

### Vercel (Recomendado)

```bash
# Instale o Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Siga as instruções e configure as variáveis de ambiente no painel do Vercel.

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t prime-hub .
docker run -p 3000:3000 prime-hub
```

## 📚 Recursos Adicionais

- [Next.js Docs](https://nextjs.org/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 📧 Suporte

Para suporte, envie um email para support@primedigitalhub.com ou abra uma issue no GitHub.

---

**Desenvolvido com ❤️ para educação de qualidade**

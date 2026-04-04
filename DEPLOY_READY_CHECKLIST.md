# NexStock — pacote pronto para GitHub + Render + Vercel

## 1) GitHub
Suba o repositório inteiro como está, sem adicionar arquivos `.env`.

## 2) Render (backend API)
- Crie um **Web Service** no Render conectado a este repositório.
- O arquivo `render.yaml` já aponta para `apps/api/Dockerfile`.
- Configure estas variáveis no Render:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `PORT=3333`
  - `NODE_ENV=production`
  - `CORS_ORIGIN=https://SEU-FRONTEND.vercel.app`
  - `WEB_URL=https://SEU-FRONTEND.vercel.app`
  - `WEB_PUBLIC_URL=https://SEU-FRONTEND.vercel.app`
  - `API_PUBLIC_URL=https://SEU-SERVICO-NO-RENDER.onrender.com`
  - `WEBHOOK_BASE_URL=https://SEU-SERVICO-NO-RENDER.onrender.com`
  - `MP_ACCESS_TOKEN` (se usar Mercado Pago)
  - `MP_APP_ID` (se usar Mercado Pago)
  - `MP_USE_SANDBOX=false`
- Depois do deploy, teste:
  - `GET /health` ou rota equivalente
  - login
  - criação de tenant/empresa
  - checkout/webhook

## 3) Vercel (frontend web)
- Importe o mesmo repositório na Vercel.
- O `vercel.json` já está configurado para buildar o frontend do monorepo.
- Defina a variável:
  - `VITE_API_URL=https://SEU-SERVICO-NO-RENDER.onrender.com`
- Faça o deploy.

## 4) Banco / Prisma
O container da API já roda:
- `prisma migrate deploy`
- depois sobe `node apps/api/dist/main.js`

## 5) Segurança
- Gere um `JWT_SECRET` novo antes de produção.
- Não suba `.env` real para o GitHub.
- Se você já expôs tokens antes, troque todos.

## 6) Fluxo ideal
- Backend no Render
- Frontend na Vercel
- PostgreSQL gerenciado no Render/Neon/Supabase

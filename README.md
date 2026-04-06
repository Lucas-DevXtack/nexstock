# NexStock SaaS

Monorepo com:
- API: Node.js + Express + Prisma + PostgreSQL
- Web: React + Vite + Tailwind

## Rodar localmente

### 1) Banco
```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

### 2) API
```bash
cd apps/api
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

### 3) Web
```bash
cd apps/web
cp .env.example .env
npm install
npm run dev
```

## Variáveis importantes

### API
Veja `apps/api/.env.example`.

### Web
Veja `apps/web/.env.example`.

## Melhorias aplicadas nesta versão
- `VITE_API_URL` no frontend no lugar de URL hardcoded
- refresh token no client com tentativa automática de renovação
- telas de `forgot password` e `reset password`
- login/signup sem credenciais mock preenchidas
- CORS com múltiplas origens
- Dockerfile para API e Web
- arquivos de apoio para deploy (`railway.json`, `vercel.json`, `README_DEPLOY.md`)

## Deploy
Veja `README_DEPLOY.md`.

## Observação
O projeto ficou mais pronto para produção, mas billing, convites e fluxos críticos ainda precisam de validação manual em ambiente público antes de abrir para clientes.


## Consentimento LGPD implementado
- banner global com aceitar/recusar analytics
- rota web `/qr` e `/qr/:slug` com tela de consentimento antes do tracking
- header `X-Consent-Analytics` enviado nas chamadas do frontend
- tracking de QR só grava no banco quando houver consentimento
- fallback sem analytics continua abrindo o site normalmente


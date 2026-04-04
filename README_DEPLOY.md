# NexStock - deploy de produção

## Stack sugerida
- Web: Vercel
- API: Railway
- Banco: Neon / Railway Postgres
- Stripe: modo test primeiro, depois live

## 1) Banco
1. Crie um Postgres gerenciado.
2. Copie a `DATABASE_URL` para a API.
3. Execute migrations em produção no primeiro deploy.

## 2) API (Railway)
Use o `apps/api/Dockerfile`.

### Variáveis obrigatórias
- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGIN` → ex: `https://seu-frontend.vercel.app`
- `WEB_URL` → ex: `https://seu-frontend.vercel.app`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_BUSINESS`

### Email
Se quiser recuperar senha por email:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

## 3) Web (Vercel)
Projeto root: `apps/web`

### Variável obrigatória
- `VITE_API_URL` → URL pública da API, ex: `https://nexstock-api.up.railway.app`

## 4) Stripe
1. Atualize as URLs públicas no dashboard do Stripe.
2. Configure o webhook para apontar para:
   - `https://sua-api.com/billing/webhook`
3. Teste upgrade, downgrade, cancelamento e falha de pagamento.

## 5) Checklist antes de abrir ao público
- build da API ok
- build do web ok
- login ok
- signup ok
- create/select tenant ok
- importação xlsx ok
- relatórios ok
- billing ok
- forgot/reset password ok
- CORS ok
- healthcheck ok

## Observação honesta
O projeto ficou bem mais pronto para deploy, mas ainda vale validar manualmente todo o fluxo de billing e convite de time em ambiente público antes de vender.

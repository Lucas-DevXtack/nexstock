# Setup rápido do Mercado Pago

1. Copie `apps/api/.env.example` para `apps/api/.env`
2. Preencha:
   - `MP_PUBLIC_KEY`
   - `MP_ACCESS_TOKEN`
   - `MP_APP_ID`
   - `WEB_URL`
   - `API_PUBLIC_URL`
3. Rode as migrations:

```bash
cd apps/api
npx prisma migrate deploy
npx prisma generate
npm run dev
```

4. Suba o frontend:

```bash
cd apps/web
npm install
npm run dev
```

5. Em ambiente local, exponha a API publicamente para o webhook funcionar.

## Teste básico

- iniciar trial do PRO
- assinar PRO com PIX
- assinar BUSINESS com cartão
- confirmar atualização do tenant em `/app/billing`
- validar bloqueio/liberação dos recursos pagos

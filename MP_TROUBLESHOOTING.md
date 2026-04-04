# Mercado Pago - troubleshooting rápido

## Erros mais comuns

### 403 `PA_UNAUTHORIZED_RESULT_FROM_POLICIES`
O token/conta/app não está autorizado para criar `checkout/preferences`.
Teste direto fora do projeto antes de culpar o código.

### 400 `Bad Request`
Em geral o token foi aceito, mas o payload tem algum campo inválido.
Os maiores suspeitos são:
- `notification_url` local (`localhost`)
- `back_urls` inválidas
- `payer.email` inválido
- valor ou estrutura do item

## Mudanças feitas neste pacote
- logs detalhados de erro do Mercado Pago
- `notification_url` só é enviada quando `API_PUBLIC_URL` é pública
- `back_urls` só entram se forem `http(s)` válidas
- `payer` só entra se houver email minimamente válido
- versão do Prisma travada em `6.19.2`

## `.env` da API
Use no mínimo:

```env
MP_ACCESS_TOKEN=SEU_TOKEN
WEB_URL=http://localhost:5173
API_PUBLIC_URL=https://sua-api-publica.example.com
```

Se estiver em dev local sem túnel público, o checkout ainda pode ser criado, mas o webhook automático ficará indisponível até você usar ngrok/Cloudflare Tunnel/domínio público.


## Webhook do Mercado Pago chegando com 500 em `payment.created` ou `merchant_order`

O projeto agora trata estes cenários como estados transitórios esperados:
- `Payment not found` logo após `payment.created`
- `merchant_order` ainda sem pagamento `approved`

Nesses casos, a API responde `200` para evitar reentrega ruidosa com falha falsa. O plano só é ativado quando o pagamento consultado estiver realmente `approved`.

Verifique os logs:
- `[billing.syncPaymentById]`
- `[billing.syncMerchantOrderById]`
- `[billing.mercadopagoWebhook.expected]`

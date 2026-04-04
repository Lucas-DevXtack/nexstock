# Billing - Mercado Pago

Este pacote troca o fluxo principal de billing para **Mercado Pago** com:

- checkout hospedado via Checkout Pro
- pagamento por **PIX e cartão**
- webhook para confirmação server-to-server
- ativação automática do plano ao aprovar o pagamento
- teste grátis de **7 dias no PRO**
- BUSINESS sem trial: libera só após pagamento
- downgrade automático do acesso efetivo quando o ciclo expira

## Variáveis necessárias

Em `apps/api/.env`:

```env
MP_PUBLIC_KEY="..."
MP_ACCESS_TOKEN="..."
MP_APP_ID="..."
WEB_URL="http://localhost:5173"
API_PUBLIC_URL="https://sua-api-publica.com"
```

## Fluxo

1. usuário escolhe PRO ou BUSINESS
2. API cria uma preferência de checkout no Mercado Pago
3. frontend redireciona para o checkout
4. Mercado Pago envia webhook para `/billing/webhook`
5. API consulta o pagamento na API do Mercado Pago
6. tenant é atualizado para `ACTIVE` quando o pagamento está `approved`
7. recursos pagos são liberados automaticamente

## Trial do PRO

- uma vez por tenant
- 7 dias
- ao fim do trial, o acesso efetivo volta para FREE se não houver pagamento aprovado

## Observação importante de ambiente local

O webhook do Mercado Pago **não alcança `localhost`** diretamente.
Para testar a ativação automática em dev local, exponha a API com um túnel público, por exemplo:

- Cloudflare Tunnel
- ngrok

Depois configure `API_PUBLIC_URL` com a URL pública do túnel.


## Escopo implementado neste pacote

O fluxo entregue neste zip usa **Checkout Pro do Mercado Pago** para cobrar e liberar o acesso.
Ele cobre bem pagamento por PIX/cartão, webhook e ativação automática.

A renovação recorrente nativa e um portal de autoatendimento completo **não foram fechados neste pacote**.
Aqui o ciclo mensal é controlado no seu backend: quando um pagamento aprovado chega, o tenant recebe 30 dias de acesso.
No fim do período, o acesso efetivo volta para FREE se não houver novo pagamento aprovado.

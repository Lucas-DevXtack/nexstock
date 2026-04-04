# Mercado Pago: sandbox vs produção

- O backend agora prioriza `init_point` por padrão.
- `sandbox_init_point` só será usado quando `MP_USE_SANDBOX=true`.
- Em produção, use credenciais reais, `MP_USE_SANDBOX=false`, `API_PUBLIC_URL` pública e `WEB_URL` do frontend real.
- Sempre gere um checkout novo depois de trocar tunnel/domínio ou credenciais.

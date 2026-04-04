# Nexstock PRO — Definições de KPIs

## Datas
- **occurredAt**: quando o fato aconteceu (base de KPIs/relatórios)
- **createdAt**: quando foi registrado (auditoria)

## Regras
- OUT com `reason=SALE` => `unitPrice` obrigatório.
- CMV e margem usam apenas OUT com `reason=SALE`.

## KPIs
- **Imobilizado** = Σ(qty_on_hand × unit_cost_atual)
- **CMV diário** = CMV_período / dias
- **Giro (dias)** = estoque_médio / CMV_diário
- **Ruptura (% dias)** = dias abaixo do mínimo / dias do período (por SKU)
- **Margem%** = (preço_venda − custo_FIFO) / preço_venda

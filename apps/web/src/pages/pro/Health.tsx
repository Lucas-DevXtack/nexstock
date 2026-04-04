import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import { api } from '../../services/api';

function fmtMoney(v: any) {
  if (v == null || Number.isNaN(Number(v))) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v));
}

export default function Health() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');
  const [upgrade, setUpgrade] = useState(false);

  async function refresh() {
    setErr(''); setUpgrade(false);
    try {
      const r = await api('/pro/health?days=30');
      setData(r);
    } catch (e: any) {
      if (e.status === 403) setUpgrade(true);
      setErr(e.message || 'Erro');
    }
  }

  useEffect(() => { refresh(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Saúde do Estoque (PRO)</h1>
          <p className="text-sm text-gray-600">KPIs explicáveis pra vender sozinho.</p>
        </div>
        <Button variant="ghost" onClick={refresh}>Atualizar</Button>
      </div>

      {upgrade && (
        <Alert type="warn">
          Requer plano PRO. Vá em <a className="underline" href="/app/billing">Plano e Cobrança</a>.
        </Alert>
      )}
      {err && <Alert type={upgrade?'warn':'error'}>{err}</Alert>}

      {!data ? (
        <Card>Carregando…</Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card title="Imobilizado">
              <div className="text-2xl font-extrabold">{fmtMoney(data.immobilized)}</div>
              <div className="mt-1 text-xs text-gray-600">Valor total parado em estoque hoje.</div>
            </Card>
            <Card title="Giro médio">
              <div className="text-2xl font-extrabold">{data.avgTurnoverDays == null ? '—' : Number(data.avgTurnoverDays).toFixed(0)} <span className="text-sm font-semibold">dias</span></div>
              <div className="mt-1 text-xs text-gray-600">Tempo médio que o estoque fica parado.</div>
            </Card>
            <Card title="Ruptura">
              <div className="text-2xl font-extrabold">{Number(data.ruptureRate * 100).toFixed(0)}%</div>
              <div className="mt-1 text-xs text-gray-600">Média de % de dias abaixo do mínimo (por SKU).</div>
            </Card>
            <Card title="Margem (período)">
              <div className="text-2xl font-extrabold">{fmtMoney(data.margin)} <span className="text-sm font-semibold">({Number(data.marginPct).toFixed(0)}%)</span></div>
              <div className="mt-1 text-xs text-gray-600">Receita - CMV no período.</div>
            </Card>
          </div>

          <Card title="Resumo que vende">
            <div className="text-sm text-gray-800">
              Você tem <b>{fmtMoney(data.immobilized)}</b> parados em estoque.{` `}
              {data.unlockEstimate != null && (
                <>Você poderia liberar aproximadamente <b>{fmtMoney(data.unlockEstimate)}</b> em caixa reduzindo para 30 dias de estoque.</>
              )}
            </div>
            <div className="mt-3 text-xs text-gray-600">
              *Estimativa simplificada (melhora com custos e preços nas saídas).
            </div>
          </Card>

          <Card title="Recomendações">
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
              {Array.isArray(data.recommendations) && data.recommendations.length ? (
                data.recommendations.map((r: string, idx: number) => <li key={idx}>{r}</li>)
              ) : (
                <li>Sem recomendações ainda. Configure mínimo e registre vendas (OUT) com preço.</li>
              )}
            </ul>
          </Card>

          <Card title="Top imobilizado">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="py-2">Produto</th>
                    <th>Imobilizado</th>
                    <th>Giro (dias)</th>
                    <th>Ruptura (% dias)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.topImmobilized?.map((p: any) => (
                    <tr key={p.productId}>
                      <td className="py-2 font-semibold">{p.name}</td>
                      <td>{fmtMoney(p.immobilizedValue)}</td>
                      <td>{p.turnoverDays == null ? '—' : Number(p.turnoverDays).toFixed(0)}</td>
                      <td>{p.ruptureDaysPct == null ? '—' : `${Number(p.ruptureDaysPct).toFixed(1)}%`}</td>
                    </tr>
                  ))}
                  {!data.topImmobilized?.length && (
                    <tr><td colSpan={4} className="py-3 text-gray-500">Sem dados ainda.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from 'recharts';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { api } from '../../services/api';

function fmtMoney(v: any) {
  if (v == null || Number.isNaN(Number(v))) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v));
}

export default function Metrics() {
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState('');
  const [upgrade, setUpgrade] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setErr(''); setUpgrade(false); setLoading(true);
    try {
      const r = await api('/pro/metrics/products?days=30');
      setItems(r);
    } catch (e: any) {
      if (e.status === 403) setUpgrade(true);
      setErr(e.message || 'Erro');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const summary = useMemo(() => {
    const totalImmobilized = items.reduce((acc, item) => acc + Number(item.immobilizedValue || 0), 0);
    const avgMargin = items.length ? items.reduce((acc, item) => acc + Number(item.marginPct || 0), 0) / items.length : 0;
    const avgTurnover = items.filter((i) => i.turnoverDays != null).length
      ? items.filter((i) => i.turnoverDays != null).reduce((acc, item) => acc + Number(item.turnoverDays || 0), 0) / items.filter((i) => i.turnoverDays != null).length
      : 0;
    return { totalImmobilized, avgMargin, avgTurnover };
  }, [items]);

  const marginChartData = useMemo(() => items.slice(0, 8).map((p) => ({
    name: p.name?.slice(0, 12) || 'Produto',
    marginPct: Number(p.marginPct || 0),
  })), [items]);

  const turnoverChartData = useMemo(() => items.slice(0, 8).map((p) => ({
    name: p.name?.slice(0, 12) || 'Produto',
    turnoverDays: Number(p.turnoverDays || 0),
    ruptureDaysPct: Number(p.ruptureDaysPct || 0),
  })), [items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">KPIs (PRO)</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Imobilizado, giro médio, ruptura e margem por produto.</p>
        </div>
        <Button variant="ghost" onClick={refresh}>Atualizar</Button>
      </div>

      {upgrade && <Alert type="warn">Requer plano PRO.</Alert>}
      {err && <Alert type={upgrade?'warn':'error'}>{err}</Alert>}

      <section className="grid gap-5 md:grid-cols-3">
        <MetricBox label="Imobilizado" value={fmtMoney(summary.totalImmobilized)} loading={loading} />
        <MetricBox label="Margem média" value={`${summary.avgMargin.toFixed(1)}%`} loading={loading} />
        <MetricBox label="Giro médio" value={summary.avgTurnover ? `${summary.avgTurnover.toFixed(1)} dias` : '—'} loading={loading} />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <Card title="Margem por produto" subtitle="Top itens por margem percentual">
          {loading ? <Skeleton className="h-[280px] w-full" /> : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marginChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="marginPct" radius={[10, 10, 0, 0]} fill="currentColor" className="text-emerald-600 dark:text-emerald-400" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Giro e ruptura" subtitle="Dias de giro x percentual de ruptura">
          {loading ? <Skeleton className="h-[280px] w-full" /> : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={turnoverChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="turnoverDays" stroke="currentColor" className="text-sky-600 dark:text-sky-400" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="ruptureDaysPct" stroke="currentColor" className="text-amber-500 dark:text-amber-400" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </section>

      <Card title={`Produtos (${items.length})`} subtitle="Indicadores detalhados por produto">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, idx) => <Skeleton key={idx} className="h-12 w-full" />)}
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-2">Produto</th>
                  <th>Qtd</th>
                  <th>Imobilizado</th>
                  <th>Giro (dias)</th>
                  <th>Margem</th>
                  <th>Ruptura (% dias)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((p) => (
                  <tr key={p.productId} className="text-slate-700 dark:text-slate-200">
                    <td className="py-3 font-semibold">{p.name}</td>
                    <td>{Number(p.qtyOnHand).toFixed(3)} {p.unit}</td>
                    <td>{fmtMoney(p.immobilizedValue)}</td>
                    <td>{p.turnoverDays == null ? '—' : Number(p.turnoverDays).toFixed(1)}</td>
                    <td>{fmtMoney(p.margin)} ({Number(p.marginPct).toFixed(1)}%)</td>
                    <td>{p.ruptureDaysPct == null ? '—' : `${Number(p.ruptureDaysPct).toFixed(1)}%`}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={6} className="py-3 text-slate-500 dark:text-slate-400">Sem dados ainda. Registre entradas/saídas com preço.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function MetricBox({ label, value, loading }: { label: string; value: string; loading: boolean }) {
  return (
    <Card className="p-5">
      <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
      {loading ? <Skeleton className="mt-3 h-10 w-32" /> : <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">{value}</div>}
    </Card>
  );
}

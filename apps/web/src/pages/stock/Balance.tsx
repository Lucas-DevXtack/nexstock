import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import { api } from '../../services/api';

function fmtMoney(v: any) {
  if (v == null || Number.isNaN(Number(v))) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v));
}

function fmtQuantity(v: any) {
  if (v == null || Number.isNaN(Number(v))) return '—';
  const n = Number(v);
  if (Number.isInteger(n)) return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(n);
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 }).format(n);
}

export default function Balance() {
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState('');

  async function refresh() {
    setErr('');
    try {
      const r = await api('/pro/stock/balance');
      setItems(r);
    } catch (e: any) {
      setErr(e.message || 'Erro');
    }
  }

  useEffect(() => { refresh(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Saldo</h1>
          <p className="text-sm text-gray-600">FIFO (lotes) + valor imobilizado.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={refresh}>Atualizar</Button>
          <Button variant="ghost" onClick={() => api('/pro/notifications/recompute', { method: 'POST', body: '{}' }).then(() => refresh())}>Recalcular alertas</Button>
        </div>
      </div>

      {err && <Alert type="error">{err}</Alert>}

      <Card title={`Itens (${items.length})`}>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-gray-500">
              <tr><th className="py-2">Produto</th><th>Qtd</th><th>Custo médio</th><th>Imobilizado</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((it) => (
                <tr key={it.productId}>
                  <td className="py-2 font-semibold">{it.name}</td>
                  <td className="text-gray-700">{fmtQuantity(it.quantity)} {it.unit}</td>
                  <td className="text-gray-700">{fmtMoney(it.costAvg)}</td>
                  <td className="text-gray-700">{fmtMoney(it.immobilizedValue)}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td className="py-3 text-gray-500" colSpan={4}>Sem estoque. Faça uma entrada (IN).</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

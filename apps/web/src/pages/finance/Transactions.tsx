import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { api } from '../../services/api';

function fmtMoney(v: any) {
  if (v == null || Number.isNaN(Number(v))) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v));
}

export default function Transactions() {
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState('');
  const [upgrade, setUpgrade] = useState(false);

  const [type, setType] = useState<'INCOME'|'EXPENSE'>('INCOME');
  const [amount, setAmount] = useState('100');
  const [description, setDescription] = useState('Vendas');

  async function refresh() {
    setErr(''); setUpgrade(false);
    try {
      const r = await api('/finance/transactions');
      setItems(r);
    } catch (e: any) {
      if (e.status === 403) setUpgrade(true);
      setErr(e.message || 'Erro');
    }
  }

  useEffect(() => { refresh(); }, []);

  async function create() {
    setErr(''); setUpgrade(false);
    try {
      await api('/finance/transactions', { method: 'POST', body: JSON.stringify({ type, amount: Number(amount), description }) });
      setAmount(''); setDescription('');
      await refresh();
    } catch (e: any) {
      if (e.status === 403) setUpgrade(true);
      setErr(e.message || 'Erro');
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Transações</h1>
        <p className="text-sm text-gray-600">Financeiro (PRO) — bloqueado por plano e flag.</p>
      </div>

      {upgrade && (
        <Alert type="warn">
          Seu tenant está no <b>FREE</b> (ou o onboarding desativou o financeiro). Para liberar:
          <ul className="mt-2 list-disc pl-5">
            <li>Onboarding com “Quero controle financeiro” ligado</li>
            <li>Plano do tenant = <b>PRO</b> (Prisma Studio)</li>
          </ul>
        </Alert>
      )}

      {err && <Alert type={upgrade ? 'warn' : 'error'}>{err}</Alert>}

      <Card title="Nova transação">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-xs font-semibold text-gray-600">Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value as any)} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-900">
              <option value="INCOME">Entrada</option>
              <option value="EXPENSE">Saída</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Valor</label>
            <Input value={amount} onChange={(e: any) => setAmount(e.target.value)} placeholder="100" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Descrição</label>
            <Input value={description} onChange={(e: any) => setDescription(e.target.value)} placeholder="Ex: Vendas" />
          </div>
        </div>
        <div className="mt-3">
          <Button onClick={create} disabled={!amount}>Adicionar</Button>
          <Button variant="ghost" onClick={refresh} className="ml-2">Atualizar</Button>
        </div>
      </Card>

      <Card title={`Lista (${items.length})`}>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-gray-500">
              <tr><th className="py-2">Tipo</th><th>Valor</th><th>Descrição</th><th>Data</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((t) => (
                <tr key={t.id}>
                  <td className="py-2 font-semibold">{t.type}</td>
                  <td className="text-gray-700">{fmtMoney(t.amount)}</td>
                  <td className="text-gray-700">{t.description || '—'}</td>
                  <td className="text-gray-700">{t.occurredAt ? new Date(t.occurredAt).toLocaleString('pt-BR') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

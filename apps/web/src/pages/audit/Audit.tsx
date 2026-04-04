import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import { api } from '../../services/api';

type AuditRow = {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  createdAt: string;
  actor: { name: string; email: string } | null;
  meta?: any;
};

export default function Audit() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [search, setSearch] = useState('');

  async function refresh() {
    setLoading(true); setErr('');
    try {
      const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      const data = await api(`/audit${query}`);
      setRows(data);
    } catch (e: any) {
      setErr(e.message || 'Erro ao carregar auditoria');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);
  const filtered = useMemo(() => rows, [rows]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Auditoria</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Acompanhe convites, cargos, ownership, empresas e ações críticas da operação.</p>
      </div>
      {err && <Alert type="error">{err}</Alert>}
      <Card title="Buscar eventos" subtitle="Filtre pelo nome da ação, entidade ou ID relacionado.">
        <div className="flex flex-col gap-3 md:flex-row">
          <Input value={search} onChange={(e: any) => setSearch(e.target.value)} placeholder="Ex.: OWNERSHIP, MEMBER, TENANT" />
          <button className="rounded-2xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white" onClick={refresh}>Atualizar</button>
        </div>
      </Card>
      <Card title={loading ? 'Carregando eventos…' : `Eventos (${filtered.length})`}>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="py-2">Quando</th><th>Ação</th><th>Entidade</th><th>Ator</th><th>Detalhes</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td className="py-3 whitespace-nowrap">{new Date(row.createdAt).toLocaleString('pt-BR')}</td>
                  <td className="font-semibold">{row.action}</td>
                  <td>{row.entity}{row.entityId ? ` • ${row.entityId.slice(0, 8)}` : ''}</td>
                  <td>{row.actor ? `${row.actor.name} (${row.actor.email})` : 'Sistema / usuário removido'}</td>
                  <td><code className="block max-w-[420px] truncate rounded bg-slate-100 px-2 py-1 text-xs dark:bg-slate-900">{JSON.stringify(row.meta || {})}</code></td>
                </tr>
              ))}
              {!loading && !filtered.length ? <tr><td colSpan={5} className="py-4 text-slate-500">Sem eventos ainda.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

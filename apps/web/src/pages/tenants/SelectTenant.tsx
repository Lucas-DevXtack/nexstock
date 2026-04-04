import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Input from '../../components/ui/Input';
import { api } from '../../services/api';
import { useTenant } from '../../app/providers/TenantProvider';

type TenantRow = {
  tenantId: string;
  name: string;
  plan: 'FREE' | 'PRO' | 'BUSINESS';
  role: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'CLOSED';
  onboardingCompleted: boolean;
  wantsFinance: boolean;
  businessType: string | null;
};

export default function SelectTenant() {
  const { setTenantId } = useTenant();
  const nav = useNavigate();
  const [items, setItems] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [busyId, setBusyId] = useState('');
  const [renameId, setRenameId] = useState('');
  const [renameValue, setRenameValue] = useState('');

  async function refresh() {
    setErr('');
    setLoading(true);
    try {
      const r = await api('/tenants');
      setItems(r);
    } catch (e: any) {
      setErr(e.message || 'Erro');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function selectTenant(id: string, onboardingCompleted: boolean, status: TenantRow['status']) {
    if (status === 'CLOSED') return;
    setTenantId(id);
    if (onboardingCompleted) nav('/app/dashboard');
    else nav('/onboarding');
  }

  async function act(id: string, action: 'archive'|'reactivate'|'close', message: string) {
    if (!window.confirm(message)) return;
    setBusyId(id + action);
    setErr('');
    try {
      await api(`/tenants/${id}/${action}`, { method: 'PATCH' });
      if (action === 'close') setTenantId('');
      
      await refresh();
    } catch (e: any) {
      setErr(e.message || 'Erro');
    } finally {
      setBusyId('');
    }
  }

  async function rename(id: string) {
    if (!renameValue.trim()) return;
    setBusyId(id + 'rename');
    setErr('');
    try {
      await api(`/tenants/${id}/name`, { method: 'PATCH', body: JSON.stringify({ name: renameValue.trim() }) });
      setRenameId('');
      setRenameValue('');
      await refresh();
    } catch (e: any) {
      setErr(e.message || 'Erro');
    } finally {
      setBusyId('');
    }
  }

  function statusPill(status: TenantRow['status']) {
    if (status === 'ACTIVE') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300';
    if (status === 'ARCHIVED') return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300';
    return 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300';
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight dark:text-white">Minhas empresas</h1>
            <p className="text-sm text-gray-600 dark:text-slate-400">Gerencie as empresas, status operacional e permissões do dono.</p>
          </div>
          <Link to="/tenant/create">
            <Button>Criar empresa</Button>
          </Link>
        </div>

        {err && <Alert type="error">{err}</Alert>}

        {loading ? (
          <Card>Carregando…</Card>
        ) : items.length === 0 ? (
          <Card title="Nenhuma empresa">
            <p className="text-sm text-gray-700 dark:text-slate-300">Você ainda não tem tenant. Crie uma empresa para começar.</p>
            <div className="mt-3">
              <Link to="/tenant/create"><Button>Criar agora</Button></Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((t) => (
              <Card key={t.tenantId} title={t.name}>
                <div className="space-y-3 text-sm text-gray-700 dark:text-slate-300">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-500">Plano</span>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-xl px-2 py-1 text-xs font-semibold ${statusPill(t.status)}`}>{t.status}</span>
                      <span className="rounded-xl bg-gray-50 px-2 py-1 text-xs font-semibold dark:bg-slate-800">{t.plan}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-500">Cargo</span>
                    <span className="text-xs font-semibold">{t.role}</span>
                  </div>

                  {renameId === t.tenantId ? (
                    <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Renomear empresa</div>
                      <Input value={renameValue} onChange={(e: any) => setRenameValue(e.target.value)} placeholder="Novo nome" />
                      <div className="mt-3 flex gap-2">
                        <Button onClick={() => rename(t.tenantId)} disabled={busyId === t.tenantId + 'rename'}>Salvar</Button>
                        <Button variant="ghost" onClick={() => { setRenameId(''); setRenameValue(''); }}>Cancelar</Button>
                      </div>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
                    <Button onClick={() => selectTenant(t.tenantId, t.onboardingCompleted, t.status)} disabled={t.status === 'CLOSED'} className="w-full">
                      {t.status === 'CLOSED' ? 'Encerrada' : 'Acessar'}
                    </Button>
                    <Link to="/app/team" onClick={() => setTenantId(t.tenantId)}><Button variant="secondary" className="w-full">Equipe</Button></Link>
                    {t.role === 'OWNER' && (
                      <>
                        <Button variant="ghost" className="w-full" onClick={() => { setRenameId(t.tenantId); setRenameValue(t.name); }}>Editar nome</Button>
                        {t.status === 'ACTIVE' ? (
                          <Button variant="ghost" className="w-full" onClick={() => act(t.tenantId, 'archive', 'Arquivar esta empresa? Isso bloqueia novas operações até reativar.')}>Arquivar</Button>
                        ) : t.status === 'ARCHIVED' ? (
                          <Button variant="ghost" className="w-full" onClick={() => act(t.tenantId, 'reactivate', 'Reativar esta empresa?')}>Reativar</Button>
                        ) : (
                          <Button variant="ghost" className="w-full" onClick={() => act(t.tenantId, 'reactivate', 'Reabrir esta empresa? Isso recoloca a empresa em modo ativo.')}>Reabrir</Button>
                        )}
                        <Button variant="danger" className="w-full sm:col-span-2" onClick={() => act(t.tenantId, 'close', `Encerrar ${t.name}? Isso corta o plano para FREE, bloqueia novas operações e mantém apenas o histórico.`)}>Encerrar empresa</Button>
                      </>
                    )}
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                    Regras: só o <b>OWNER</b> pode editar nome, arquivar, reabrir ou encerrar empresa. O <b>MANAGER</b> pode operar equipe se o dono permitir, e o <b>STAFF</b> opera o dia a dia conforme permissões.
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

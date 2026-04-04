import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Input from '../../components/ui/Input';
import { api } from '../../services/api';
import { storage } from '../../utils/storage';
import { useNavigate } from 'react-router-dom';

type Member = {
  userId: string;
  name: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
  createdAt: string;
};

type Invite = {
  id: string;
  email: string;
  role: 'STAFF' | 'MANAGER' | 'OWNER';
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED';
  token: string;
  link?: string;
  emailSent?: boolean;
};

type PermissionRow = { key: string; allowed: boolean };
const PERMISSION_KEYS = ['STOCK_READ','STOCK_WRITE','FINANCE_READ','FINANCE_WRITE','REPORTS_READ','REPORTS_EXPORT','TEAM_READ','TEAM_INVITE','SETTINGS_READ','SETTINGS_WRITE','AUDIT_READ'];

function pill(status: string) {
  if (status === 'PENDING') return 'rounded-full bg-amber-50 px-2 py-1 text-amber-700';
  if (status === 'ACCEPTED') return 'rounded-full bg-emerald-50 px-2 py-1 text-emerald-700';
  return 'rounded-full bg-slate-100 px-2 py-1 text-slate-600';
}

export default function Team() {
  const nav = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [toast, setToast] = useState('');
  const [upgrade, setUpgrade] = useState(false);
  const [busy, setBusy] = useState('');
  const [meEmail, setMeEmail] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'STAFF'|'MANAGER'>('STAFF');
  const webUrl = useMemo(() => window.location.origin, []);
  const meRole = members.find((m) => m.email === meEmail)?.role;
  const isOwner = meRole === 'OWNER';
  const isManagerOrOwner = meRole === 'OWNER' || meRole === 'MANAGER';

  async function refresh() {
    setErr(''); setLoading(true); setUpgrade(false);
    try {
      const me = await api('/auth/me');
      setMeEmail(me?.email || '');
      const ms = await api('/members');
      setMembers(ms);
      try {
        const inv = await api('/members/invites');
        setInvites(inv.map((i: Invite) => ({ ...i, link: `${webUrl}/invite/accept?token=${encodeURIComponent(i.token)}` })));
      } catch {
        setInvites([]);
      }
    } catch (e: any) {
      if (e.status === 403) setUpgrade(true);
      setErr(e.message || 'Erro');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function invite() {
    setErr(''); setUpgrade(false); setToast('');
    try {
      const inv = await api('/members/invites', { method: 'POST', body: JSON.stringify({ email, role }) });
      setEmail('');
      const item: Invite = { ...inv, link: inv.link || `${webUrl}/invite/accept?token=${encodeURIComponent(inv.token)}` };
      setInvites([item, ...invites]);
      setToast(inv.emailSent ? 'Convite enviado por email.' : 'SMTP desativado — copie o link e envie manualmente.');
    } catch (e: any) {
      if (e.status === 403) setUpgrade(true);
      setErr(e.message || 'Erro');
    }
  }

  async function revoke(id: string) {
    setErr(''); setToast('');
    try { await api(`/members/invites/${id}`, { method: 'DELETE' }); await refresh(); }
    catch (e: any) { setErr(e.message || 'Erro'); }
  }

  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); setToast('Link copiado.'); setTimeout(() => setToast(''), 1500); }
    catch { setToast('Não consegui copiar.'); }
  }

  function defaultPermission(role: Member['role'], key: string) {
    if (role === 'MANAGER') return !['SETTINGS_WRITE','AUDIT_READ'].includes(key);
    return ['STOCK_READ','STOCK_WRITE','FINANCE_READ','REPORTS_READ'].includes(key);
  }

  async function loadPermissions(member: Member) {
    setSelectedMember(member);
    if (!isOwner || member.role === 'OWNER') return;
    try {
      const rows: PermissionRow[] = await api(`/members/${member.userId}/permissions`);
      const map: Record<string, boolean> = {};
      for (const key of PERMISSION_KEYS) map[key] = rows.find((r) => r.key === key)?.allowed ?? defaultPermission(member.role, key);
      setSelectedPermissions(map);
    } catch (e: any) {
      setErr(e.message || 'Erro ao carregar permissões');
    }
  }

  async function updateRole(member: Member, nextRole: 'MANAGER' | 'STAFF' | 'OWNER') {
    setBusy(member.userId + 'role');
    setErr('');
    try {
      await api(`/members/${member.userId}/role`, { method: 'PATCH', body: JSON.stringify({ role: nextRole }) });
      await refresh();
      if (selectedMember?.userId === member.userId) setSelectedMember({ ...member, role: nextRole });
    } catch (e: any) {
      setErr(e.message || 'Erro ao atualizar cargo');
    } finally { setBusy(''); }
  }

  async function savePermissions() {
    if (!selectedMember) return;
    setBusy(selectedMember.userId + 'perms');
    setErr('');
    try {
      await api(`/members/${selectedMember.userId}/permissions`, { method: 'PUT', body: JSON.stringify({ permissions: Object.entries(selectedPermissions).map(([key, allowed]) => ({ key, allowed })) }) });
      setToast('Permissões salvas.');
    } catch (e: any) {
      setErr(e.message || 'Erro ao salvar permissões');
    } finally { setBusy(''); }
  }

  async function handleRemove(member: Member) {
    if (!window.confirm(`Remover ${member.name} desta empresa?`)) return;
    setBusy(member.userId + 'remove');
    setErr('');
    try {
      await api(`/members/${member.userId}`, { method: 'DELETE' });
      if (selectedMember?.userId === member.userId) setSelectedMember(null);
      await refresh();
      setToast('Membro removido.');
    } catch (e: any) {
      setErr(e.message || 'Erro ao remover membro');
    } finally { setBusy(''); }
  }

  async function handleTransferOwnership(member: Member) {
    if (!window.confirm(`Transferir a propriedade para ${member.name}? Você passará a ser MANAGER.`)) return;
    setBusy(member.userId + 'transfer');
    setErr('');
    try {
      await api(`/members/${member.userId}/transfer-ownership`, { method: 'POST' });
      await refresh();
      setSelectedMember(null);
      setToast('Ownership transferido com sucesso.');
    } catch (e: any) {
      setErr(e.message || 'Erro ao transferir ownership');
    } finally { setBusy(''); }
  }

  async function handleLeaveCompany() {
    if (!window.confirm('Sair desta empresa agora?')) return;
    setBusy('leave');
    setErr('');
    try {
      await api('/members/leave', { method: 'POST' });
      storage.tenantId = '';
      nav('/tenant/select');
    } catch (e: any) {
      setErr(e.message || 'Erro ao sair da empresa');
    } finally { setBusy(''); }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Equipe</h1>
          <p className="text-sm text-gray-600 dark:text-slate-400">Cargos, permissões, transferência de ownership e saída segura da empresa.</p>
        </div>
        <div>
          <Button variant="ghost" onClick={handleLeaveCompany} disabled={busy === 'leave'}>Sair da empresa</Button>
        </div>
      </div>

      {upgrade && <Alert type="warn">Este módulo exige plano <b>BUSINESS</b>.</Alert>}
      {err && <Alert type={upgrade ? 'warn' : 'error'}>{err}</Alert>}
      {toast && <Alert type="info">{toast}</Alert>}

      <Card title={loading ? 'Carregando membros…' : `Membros (${members.length})`}>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-slate-500">
              <tr><th className="py-2">Nome</th><th>Email</th><th>Role</th><th></th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {members.map((m) => (
                <tr key={m.userId}>
                  <td className="py-2 font-semibold">{m.name}{m.email === meEmail ? ' (você)' : ''}</td>
                  <td className="text-gray-700 dark:text-slate-300">{m.email}</td>
                  <td className="text-gray-700 dark:text-slate-300">{m.role}</td>
                  <td className="space-x-2 text-right">
                    <Button variant="ghost" onClick={() => loadPermissions(m)}>Abrir</Button>
                    {isManagerOrOwner && m.email !== meEmail && (isOwner || m.role === 'STAFF') ? (
                      <Button variant="danger" onClick={() => handleRemove(m)} disabled={busy === m.userId + 'remove'}>Remover</Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedMember && (
        <Card title={`Permissões • ${selectedMember.name}`}>
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
              <b>Regra do negócio:</b> o <b>OWNER</b> controla nome da empresa, arquivamento, encerramento e define o que o <b>MANAGER</b> e o <b>STAFF</b> podem operar.
            </div>
            {isOwner && selectedMember.role !== 'OWNER' ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <Button variant={selectedMember.role === 'STAFF' ? 'primary' : 'ghost'} onClick={() => updateRole(selectedMember, 'STAFF')} disabled={busy === selectedMember.userId + 'role'}>STAFF</Button>
                  <Button variant={selectedMember.role === 'MANAGER' ? 'primary' : 'ghost'} onClick={() => updateRole(selectedMember, 'MANAGER')} disabled={busy === selectedMember.userId + 'role'}>MANAGER</Button>
                  <Button variant="ghost" onClick={() => handleTransferOwnership(selectedMember)} disabled={busy === selectedMember.userId + 'transfer'}>Transferir ownership</Button>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {PERMISSION_KEYS.map((key) => (
                    <label key={key} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
                      <span>{key}</span>
                      <input type="checkbox" checked={!!selectedPermissions[key]} onChange={(e) => setSelectedPermissions((prev) => ({ ...prev, [key]: e.target.checked }))} />
                    </label>
                  ))}
                </div>
                <div><Button onClick={savePermissions} disabled={busy === selectedMember.userId + 'perms'}>Salvar permissões</Button></div>
              </>
            ) : (
              <div className="text-sm text-slate-600 dark:text-slate-400">Somente o OWNER pode editar cargos, transferir propriedade e alterar permissões.</div>
            )}
          </div>
        </Card>
      )}

      <Card title="Convidar usuário (MANAGER+)" subtitle="Managers e donos podem criar convites; ownership continua exclusivo do dono.">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-gray-600 dark:text-slate-400">Email</label>
            <Input value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="pessoa@empresa.com" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-slate-400">Cargo inicial</label>
            <select value={role} onChange={(e) => setRole(e.target.value as any)} className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:border-gray-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
              <option value="STAFF">STAFF</option>
              <option value="MANAGER">MANAGER</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <Button onClick={invite} disabled={!email.trim()}>Gerar convite</Button>
          <Button variant="ghost" onClick={refresh} className="ml-2">Atualizar</Button>
        </div>
      </Card>

      <Card title={`Convites (${invites.length})`}>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-slate-500">
              <tr><th className="py-2">Email</th><th>Role</th><th>Status</th><th>Link mágico</th><th></th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {invites.map((i) => (
                <tr key={i.id}>
                  <td className="py-2 font-semibold">{i.email}</td>
                  <td className="text-gray-700 dark:text-slate-300">{i.role}</td>
                  <td className="text-gray-700 dark:text-slate-300"><span className={pill(i.status)}>{i.status}</span></td>
                  <td className="text-gray-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <code className="max-w-[280px] truncate rounded bg-gray-100 px-2 py-1 text-xs dark:bg-slate-900">{i.link}</code>
                      <button className="text-xs font-semibold text-gray-900 underline dark:text-white" onClick={() => copy(i.link || '')}>Copiar</button>
                    </div>
                  </td>
                  <td className="text-right">
                    {i.status === 'PENDING' ? <button className="text-xs font-semibold text-red-700 hover:underline" onClick={() => revoke(i.id)}>Revogar</button> : <span className="text-xs text-gray-400">—</span>}
                  </td>
                </tr>
              ))}
              {invites.length === 0 && <tr><td className="py-3 text-sm text-gray-500" colSpan={5}>Sem convites.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

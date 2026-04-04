import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { api } from '../../services/api';
import { useAuth } from '../../app/providers/AuthProvider';

export default function Profile() {
  const nav = useNavigate();
  const { logout } = useAuth();
  const [me, setMe] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api('/auth/me')
      .then((data) => {
        setMe(data);
        setDisplayName(data?.name || '');
        setAvatarPreview(data?.avatarUrl || '');
      })
      .catch((e: any) => setErr(e.message || 'Erro ao carregar perfil.'));
  }, []);

  const initials = useMemo(() => {
    const name = String(displayName || me?.name || 'Perfil').trim();
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((v) => v[0]?.toUpperCase() || '')
      .join('');
  }, [displayName, me?.name]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr('');
    if (!file.type.startsWith('image/')) return setErr('Selecione uma imagem válida.');
    if (file.size > 1024 * 1024) return setErr('A imagem precisa ter até 1MB.');

    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(String(reader.result || ''));
    reader.readAsDataURL(file);
  }

  async function saveProfile() {
    setErr('');
    setMsg('');
    setSavingProfile(true);
    try {
      const updated = await api('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: displayName, avatarUrl: avatarPreview || null }),
      });
      setMe(updated);
      setDisplayName(updated?.name || '');
      setAvatarPreview(updated?.avatarUrl || '');
      window.dispatchEvent(new Event('nexstock:profile-updated'));
      setMsg('Perfil atualizado com sucesso.');
    } catch (e: any) {
      setErr(e.message || 'Erro ao atualizar perfil.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setMsg('');

    if (newPassword.length < 8) return setErr('A nova senha precisa ter pelo menos 8 caracteres.');
    if (newPassword !== confirmPassword) return setErr('A confirmação da senha não confere.');

    setSaving(true);
    try {
      await api('/auth/change-password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMsg('Senha alterada com sucesso.');
    } catch (e: any) {
      setErr(e.message || 'Erro ao alterar senha.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setErr('');
    setMsg('');
    if (confirmDelete !== 'DELETAR') return setErr('Digite DELETAR para confirmar a exclusão da conta.');
    if (!deletePassword) return setErr('Informe sua senha atual para excluir a conta.');

    setDeleting(true);
    try {
      await api('/auth/delete-account', {
        method: 'DELETE',
        body: JSON.stringify({ password: deletePassword }),
      });
      await logout();
      nav('/login');
    } catch (e: any) {
      setErr(e.message || 'Erro ao deletar conta.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {err && <Alert type="error">{err}</Alert>}
      {msg && <Alert type="info">{msg}</Alert>}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card title="Minha conta" subtitle="Dados básicos e foto do usuário">
          <div className="grid gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="h-24 w-24 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-sm">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Foto de perfil" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-2xl font-bold text-slate-500">{initials || 'PA'}</div>
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nome</label>
                  <Input value={displayName} onChange={(e: any) => setDisplayName(e.target.value)} placeholder="Seu nome" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex cursor-pointer items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    Escolher foto
                  </label>
                  <Button type="button" variant="secondary" onClick={() => setAvatarPreview('')}>
                    Remover foto
                  </Button>
                  <Button type="button" onClick={saveProfile} disabled={savingProfile}>
                    {savingProfile ? 'Salvando...' : 'Salvar perfil'}
                  </Button>
                </div>
                <p className="text-xs text-slate-500">Use JPG, PNG ou WebP com até 1MB.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="E-mail" value={me?.email || '—'} />
              <Field label="Criado em" value={me?.createdAt ? new Date(me.createdAt).toLocaleDateString('pt-BR') : '—'} />
              <Field label="Status" value="Ativo" />
              <Field label="Foto" value={avatarPreview ? 'Configurada' : 'Sem foto'} />
            </div>
          </div>
        </Card>

        <Card title="Segurança" subtitle="Altere sua senha com segurança">
          <form className="grid gap-3" onSubmit={submit}>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Senha atual</label>
              <Input type="password" value={currentPassword} onChange={(e: any) => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nova senha</label>
              <Input type="password" value={newPassword} onChange={(e: any) => setNewPassword(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Confirmar nova senha</label>
              <Input type="password" value={confirmPassword} onChange={(e: any) => setConfirmPassword(e.target.value)} />
            </div>
            <div>
              <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Atualizar senha'}</Button>
            </div>
          </form>
        </Card>
      </div>

      <Card title="Zona de perigo" subtitle="A exclusão da conta é irreversível">
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[24px] border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-900">
            <p className="font-semibold">Ao deletar sua conta:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>seu acesso será removido imediatamente;</li>
              <li>tokens e sessões ativas serão encerrados;</li>
              <li>se você ainda pertencer a empresas, a exclusão será bloqueada até sair delas.</li>
            </ul>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Senha atual</label>
              <Input type="password" value={deletePassword} onChange={(e: any) => setDeletePassword(e.target.value)} placeholder="Digite sua senha" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Confirmação</label>
              <Input value={confirmDelete} onChange={(e: any) => setConfirmDelete(e.target.value)} placeholder="Digite DELETAR" />
            </div>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Excluindo conta...' : 'Deletar conta'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">{value}</div>
    </div>
  );
}

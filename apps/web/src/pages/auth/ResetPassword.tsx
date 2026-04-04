import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { useAuth } from '../../app/providers/AuthProvider';

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token') || '', [params]);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: any) {
    e.preventDefault();
    setErr('');
    setMsg('');

    if (!token) return setErr('Token inválido ou ausente.');
    if (password.length < 8) return setErr('A senha deve ter pelo menos 8 caracteres.');
    if (password !== confirm) return setErr('As senhas não conferem.');

    setLoading(true);
    try {
      await resetPassword(token, password);
      setMsg('Senha redefinida com sucesso. Você já pode entrar.');
      setTimeout(() => nav('/login'), 1200);
    } catch (e: any) {
      setErr(e.message || 'Erro');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-md items-center p-6">
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h1 className="text-2xl font-extrabold tracking-tight">Redefinir senha</h1>
            <p className="text-sm text-gray-600">Crie uma nova senha para sua conta.</p>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">Nova senha</label>
              <Input value={password} onChange={(e: any) => setPassword(e.target.value)} type="password" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Confirmar senha</label>
              <Input value={confirm} onChange={(e: any) => setConfirm(e.target.value)} type="password" />
            </div>

            {err && <Alert type="error">{err}</Alert>}
            {msg && <Alert type="info">{msg}</Alert>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Salvando…' : 'Salvar nova senha'}</Button>
          </form>

          <div className="mt-4 text-sm text-gray-600">
            <Link className="font-semibold text-gray-900 underline" to="/login">Voltar para login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

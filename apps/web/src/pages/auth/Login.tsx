import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { useAuth } from '../../app/providers/AuthProvider';

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f7f5] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-700 text-3xl font-black text-white">N</div>
              <div className="text-left">
                <div className="text-4xl font-extrabold tracking-tight text-slate-900">NexStock</div>
                <div className="text-xl text-slate-500">Estoque e Financeiro</div>
              </div>
            </div>
          </div>
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.3)]">{children}</div>
          <div className="mt-8 space-y-3 text-center">
            <div className="text-sm text-slate-400">© 2026 NexStock</div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
              <Link className="transition hover:text-slate-900" to="/terms">Termos de Uso</Link>
              <Link className="transition hover:text-slate-900" to="/privacy">Política de Privacidade</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function submit(e: any) {
    e.preventDefault();
    setErr('');
    try {
      await login(email, password);
      nav('/tenant/select');
    } catch (e: any) {
      setErr(e.message || 'Erro');
    }
  }

  return (
    <AuthShell>
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Bem-vindo de volta!</h1>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-500">E-mail</label>
          <Input value={email} onChange={(e: any) => setEmail(e.target.value)} type="email" placeholder="voce@empresa.com" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-500">Senha</label>
          <Input value={password} onChange={(e: any) => setPassword(e.target.value)} type="password" placeholder="••••••••" />
        </div>

        {err && <Alert type="error">{err}</Alert>}
        <Button type="submit" className="w-full text-base">Entrar</Button>
      </form>

      <div className="mt-6 flex items-center justify-between gap-3 text-sm text-slate-500">
        <Link className="font-medium hover:text-slate-900" to="/forgot-password">Esqueceu sua senha?</Link>
        <Link className="font-medium hover:text-slate-900" to="/signup">Não tem uma conta? Registre-se</Link>
      </div>
    </AuthShell>
  );
}

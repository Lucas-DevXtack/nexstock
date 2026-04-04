import { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { useAuth } from '../../app/providers/AuthProvider';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: any) {
    e.preventDefault();
    setErr('');
    setMsg('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setMsg('Se o email existir, o link de recuperação foi enviado.');
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
            <h1 className="text-2xl font-extrabold tracking-tight">Recuperar senha</h1>
            <p className="text-sm text-gray-600">Enviaremos um link para redefinir sua senha.</p>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">Email</label>
              <Input value={email} onChange={(e: any) => setEmail(e.target.value)} type="email" placeholder="voce@empresa.com" />
            </div>

            {err && <Alert type="error">{err}</Alert>}
            {msg && <Alert type="info">{msg}</Alert>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Enviando…' : 'Enviar link'}</Button>
          </form>

          <div className="mt-4 text-sm text-gray-600">
            <Link className="font-semibold text-gray-900 underline" to="/login">Voltar para login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

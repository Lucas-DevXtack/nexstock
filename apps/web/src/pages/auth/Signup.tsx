import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { useAuth } from '../../app/providers/AuthProvider';

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function submit(e: any) {
    e.preventDefault();
    setErr('');
    try {
      await signup(name, email, password);
      nav('/tenant/create');
    } catch (e: any) {
      setErr(e.message || 'Erro');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-md items-center p-6">
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h1 className="text-2xl font-extrabold tracking-tight">Criar conta</h1>
            <p className="text-sm text-gray-600">Plano FREE começa no estoque.</p>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">Nome</label>
              <Input value={name} onChange={(e: any) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Email</label>
              <Input value={email} onChange={(e: any) => setEmail(e.target.value)} type="email" placeholder="voce@empresa.com" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Senha</label>
              <Input value={password} onChange={(e: any) => setPassword(e.target.value)} type="password" placeholder="Mínimo 8 caracteres" />
            </div>

            {err && <Alert type="error">{err}</Alert>}
            <Button type="submit" className="w-full">Criar</Button>
          </form>


          <div className="mt-4 text-xs leading-6 text-gray-500">
            Ao criar sua conta, você concorda com os <Link className="font-semibold text-gray-900 underline" to="/terms">Termos de Uso</Link> e com a <Link className="font-semibold text-gray-900 underline" to="/privacy">Política de Privacidade</Link>.
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Já tem conta? <Link className="font-semibold text-gray-900 underline" to="/login">Entrar</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

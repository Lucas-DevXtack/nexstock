import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { api } from '../../services/api';
import { useTenant } from '../../app/providers/TenantProvider';
import { useAuth } from '../../app/providers/AuthProvider';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function AcceptInvite() {
  const q = useQuery();
  const [token, setToken] = useState(q.get('token') || '');
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const nav = useNavigate();
  const { setTenantId } = useTenant();
  const { token: authToken } = useAuth();

  async function accept(v?: string) {
    const t = (v ?? token).trim();
    if (!t) return;
    setErr(''); setInfo('');
    try {
      const r = await api('/members/accept', { method: 'POST', body: JSON.stringify({ token: t }) });
      setTenantId(r.tenantId);
      nav('/app/dashboard');
    } catch (e: any) {
      setErr(e.message || 'Erro');
    }
  }

  useEffect(() => {
    const qt = q.get('token');
    if (qt) {
      if (!authToken) {
        setInfo('Você precisa estar logado com o email convidado para aceitar o convite.');
        return;
      }
      accept(qt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Aceitar convite</h1>

        {info && (
          <Alert type="warn">
            {info} <Link className="font-semibold underline" to="/login">Ir para login</Link>
          </Alert>
        )}

        {err && <Alert type="error">{err}</Alert>}

        <Card title="Token do convite">
          <label className="text-xs font-semibold text-gray-600">Token</label>
          <Input value={token} onChange={(e: any) => setToken(e.target.value)} placeholder="cole o token aqui" />
          <div className="mt-3 flex gap-2">
            <Button onClick={() => accept()} disabled={!token.trim() || !authToken}>Aceitar e entrar</Button>
            {!authToken && (
              <Link to="/login"><Button variant="ghost">Fazer login</Button></Link>
            )}
          </div>
          <p className="mt-3 text-xs text-gray-600">
            Link mágico: <code className="rounded bg-gray-100 px-1">{`/invite/accept?token=...`}</code>
          </p>
        </Card>
      </div>
    </div>
  );
}

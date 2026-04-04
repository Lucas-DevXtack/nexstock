import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { api } from '../../services/api';
import { useTenant } from '../../app/providers/TenantProvider';

export default function CreateTenant() {
  const [name, setName] = useState('Minha Empresa');
  const [err, setErr] = useState('');
  const nav = useNavigate();
  const { setTenantId } = useTenant();

  async function create() {
    setErr('');
    try {
      const t = await api('/tenants', { method: 'POST', body: JSON.stringify({ name }) });
      setTenantId(t.id);
      nav('/onboarding');
    } catch (e: any) {
      setErr(e?.status && e.status < 500 ? e.message || 'Erro ao criar empresa.' : 'Não foi possível criar a empresa agora.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Criar empresa</h1>
        {err && <Alert type="error">{err}</Alert>}

        <Card title="Dados">
          <label className="text-xs font-semibold text-gray-600">Nome</label>
          <Input value={name} onChange={(e: any) => setName(e.target.value)} />
          <div className="mt-3"><Button onClick={create}>Criar</Button></div>
        </Card>
      </div>
    </div>
  );
}

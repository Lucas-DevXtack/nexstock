import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { api } from '../../services/api';

export default function Onboarding() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [err, setErr] = useState('');

  const [businessType, setBusinessType] = useState('mercado');
  const [regime, setRegime] = useState('Simples');
  const [usesStock, setUsesStock] = useState(true);
  const [avgTicket, setAvgTicket] = useState('45.50');
  const [monthlyVolume, setMonthlyVolume] = useState('50000');
  const [wantsFinance, setWantsFinance] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await api('/onboarding/status');
        setCompleted(Boolean(r.completed));
        if (r.profile) {
          setBusinessType(r.profile.businessType || businessType);
          setRegime(r.profile.regime || regime);
          setUsesStock(Boolean(r.profile.usesStock));
          setWantsFinance(Boolean(r.profile.wantsFinance));
          if (r.profile.avgTicket != null) setAvgTicket(String(r.profile.avgTicket));
          if (r.profile.monthlyVolume != null) setMonthlyVolume(String(r.profile.monthlyVolume));
        }
      } catch (e: any) {
        setErr(e.message || 'Erro');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit() {
    setErr('');
    try {
      await api('/onboarding/submit', {
        method: 'POST',
        body: JSON.stringify({
          businessType, regime, usesStock,
          avgTicket: avgTicket ? Number(avgTicket) : undefined,
          monthlyVolume: monthlyVolume ? Number(monthlyVolume) : undefined,
          wantsFinance,
        }),
      });
      nav('/app/dashboard');
    } catch (e: any) {
      setErr(e.message || 'Erro');
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-50 p-6"><div className="mx-auto max-w-xl"><Card>Carregando…</Card></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-xl space-y-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Onboarding</h1>
          <p className="text-sm text-gray-600">Configuração inicial (obrigatória).</p>
        </div>

        {completed && <Alert type="info">Onboarding já preenchido. Você pode editar e salvar.</Alert>}
        {err && <Alert type="error">{err}</Alert>}

        <Card title="Dados mínimos">
          <div className="grid gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">Tipo de negócio</label>
              <Input value={businessType} onChange={(e: any) => setBusinessType(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Regime</label>
              <Input value={regime} onChange={(e: any) => setRegime(e.target.value)} />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={usesStock} onChange={(e) => setUsesStock(e.target.checked)} />
              Controla estoque hoje
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600">Ticket médio</label>
                <Input value={avgTicket} onChange={(e: any) => setAvgTicket(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Volume mensal</label>
                <Input value={monthlyVolume} onChange={(e: any) => setMonthlyVolume(e.target.value)} />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={wantsFinance} onChange={(e) => setWantsFinance(e.target.checked)} />
              Quero controle financeiro
            </label>

            <div className="pt-2">
              <Button onClick={submit}>Salvar e continuar</Button>
            </div>
          </div>
        </Card>

        <Card title="Ativação rápida">
          <div className="space-y-2 text-sm text-gray-700">
            <div>Quer subir o catálogo rápido? Importa via Excel (recurso PRO).</div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => nav('/app/import/products')}>Abrir importação</Button>
              <Button onClick={() => nav('/app/billing')}>Ver planos</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

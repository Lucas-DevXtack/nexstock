import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import { api } from '../../services/api';
import ImportProducts from '../importexport/ImportProducts';

export default function ImportWizard() {
  const [status, setStatus] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const s = await api('/onboarding/status');
        setStatus(s);
      } catch (e: any) {
        setErr(e.message || 'Erro');
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Onboarding — Importação</h1>
        <p className="text-sm text-gray-600">Suba sua planilha, corrija erros e confirme. Valor no mesmo dia.</p>
      </div>

      {err && <Alert type="error">{err}</Alert>}

      {status && (
        <Card title="Checklist">
          <div className="grid gap-2 text-sm">
            <div>Produtos importados: <b>{status.checklist?.hasProducts ? '✅' : '⏳'}</b></div>
            <div>Estoque inicial: <b>{status.checklist?.hasStock ? '✅' : '⏳'}</b></div>
            <div>Primeira venda: <b>{status.checklist?.hasSale ? '✅' : '⏳'}</b></div>
            <div className="mt-2 text-xs text-gray-600">Plano atual: <b>{status.plan}</b></div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/app/dashboard"><Button variant="secondary">Ir pro Dashboard</Button></Link>
            <Link to="/app/pro/health"><Button variant="primary">Ver Saúde do Estoque</Button></Link>
          </div>
        </Card>
      )}

      <ImportProducts />
    </div>
  );
}

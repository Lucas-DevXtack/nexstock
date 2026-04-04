import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

export default function Reports() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()+1);
  const [err, setErr] = useState('');

  function dl(path: string) {
    setErr('');
    try {
      window.open(path, '_blank');
    } catch (e: any) {
      setErr(e.message || 'Erro');
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Relatórios</h1>
        <p className="text-sm text-gray-600">Exportar mensal/anual (CSV/PDF) — PRO.</p>
      </div>
      {err && <Alert type="error">{err}</Alert>}

      <Card title="Período">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600">Ano</label>
            <input className="mt-1 w-28 rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
              type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Mês</label>
            <input className="mt-1 w-20 rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
              type="number" min={1} max={12} value={month} onChange={(e) => setMonth(Number(e.target.value))} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Mensal">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => dl(`/reports/monthly.csv?year=${year}&month=${month}`)}>CSV</Button>
            <Button onClick={() => dl(`/reports/monthly.pdf?year=${year}&month=${month}`)}>PDF</Button>
          </div>
        </Card>
        <Card title="Anual">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => dl(`/reports/annual.csv?year=${year}`)}>CSV</Button>
            <Button onClick={() => dl(`/reports/annual.pdf?year=${year}`)}>PDF</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

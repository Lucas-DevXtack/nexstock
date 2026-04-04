import { useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { api, apiDownload } from '../../services/api';

type ValidateResp = {
  importToken: string;
  summary: { total: number; valid: number; invalid: number };
  errors: { row: number; field?: string; code: string; message: string }[];
  preview: any[];
};

export default function ImportProducts() {
  const [file, setFile] = useState<File|null>(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [upgrade, setUpgrade] = useState(false);

  const [validating, setValidating] = useState(false);
  const [committing, setCommitting] = useState(false);

  const [validated, setValidated] = useState<ValidateResp|null>(null);
  const [committed, setCommitted] = useState<any>(null);

  const canCommit = useMemo(() => Boolean(validated && validated.summary.invalid === 0 && validated.summary.total > 0), [validated]);

  async function downloadTemplate() {
    setErr(''); setMsg(''); setUpgrade(false);
    try {
      const r = await apiDownload('/products/xlsx/template');
      if (r.status === 403) { setUpgrade(true); throw new Error('Requer permissão/Plano'); }
      if (!r.ok) throw new Error('Falha ao baixar template');
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products_template.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setErr(e.message || 'Erro');
    }
  }

  async function downloadErrors() {
    setErr(''); setMsg('');
    if (!validated?.importToken) return;
    try {
      const r = await apiDownload(`/products/xlsx/errors.xlsx?token=${encodeURIComponent(validated.importToken)}`);
      if (!r.ok) throw new Error('Falha ao baixar errors.xlsx');
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'errors.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setErr(e.message || 'Erro');
    }
  }

  async function validate() {
    setErr(''); setMsg(''); setCommitted(null); setUpgrade(false);
    if (!file) { setErr('Selecione um arquivo .xlsx'); return; }

    const base64 = await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result || ''));
      fr.onerror = () => reject(new Error('Falha ao ler arquivo'));
      fr.readAsDataURL(file);
    });

    setValidating(true);
    try {
      const r = await api('/products/xlsx/validate', { method: 'POST', body: JSON.stringify({ base64 }) });
      setValidated(r);
      if (r.summary?.total === 0) setErr('Planilha vazia (sem linhas úteis).');
      else if (r.summary?.invalid > 0) setErr(`Foram encontrados erros em ${r.summary.invalid} linhas.`);
      else setMsg('Validação OK. Pronto para confirmar importação.');
    } catch (e: any) {
      if (e.status === 403) setUpgrade(true);
      setErr(e.message || 'Erro');
    } finally {
      setValidating(false);
    }
  }

  async function commit() {
    setErr(''); setMsg(''); setUpgrade(false);
    if (!validated?.importToken) { setErr('Valide antes de confirmar.'); return; }
    if (!canCommit) { setErr('Existem erros na planilha. Corrija e valide novamente.'); return; }

    setCommitting(true);
    try {
      const r = await api('/products/xlsx/commit', { method: 'POST', body: JSON.stringify({ importToken: validated.importToken }) });
      setCommitted(r);
      setMsg(`Importação concluída: ${r.created} produtos. Estoque inicial: ${r.initialStockMoves}.`);
    } catch (e: any) {
      if (e.status === 403) setUpgrade(true);
      setErr(e.message || 'Erro');
    } finally {
      setCommitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Importar Produtos (XLSX)</h1>
          <p className="text-sm text-gray-600">Validação por linha + confirmação transacional.</p>
        </div>
        <Button onClick={downloadTemplate} variant="secondary">Baixar template</Button>
      </div>

      {upgrade && <Alert type="warn">Seu plano/permissões não permitem essa ação.</Alert>}
      {err && <Alert type="error">{err}</Alert>}
      {msg && <Alert type="info">{msg}</Alert>}

      <Card title="1) Upload">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div className="flex gap-2">
            <Button onClick={validate} disabled={!file || validating}>
              {validating ? 'Validando…' : 'Validar'}
            </Button>
            <Button onClick={commit} disabled={!canCommit || committing} variant="primary">
              {committing ? 'Confirmando…' : 'Confirmar importação'}
            </Button>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-600">
          Dica: preencha <b>sku</b> (recomendado), <b>unitCode</b>, <b>minStock</b> e opcionalmente <b>initialQty</b> + <b>initialUnitCost</b>.
        </div>
      </Card>

      {validated && (
        <Card title="2) Resultado da validação">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-gray-50 px-3 py-2 text-sm">
              Total: <b>{validated.summary.total}</b>
            </div>
            <div className="rounded-xl bg-gray-50 px-3 py-2 text-sm">
              Válidas: <b>{validated.summary.valid}</b>
            </div>
            <div className="rounded-xl bg-gray-50 px-3 py-2 text-sm">
              Com erro: <b>{validated.summary.invalid}</b>
            </div>
            {validated.summary.invalid > 0 && (
              <Button onClick={downloadErrors} variant="secondary">Baixar errors.xlsx</Button>
            )}
          </div>

          {validated.errors?.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-semibold">Principais erros (até 20)</div>
              <div className="mt-2 overflow-auto rounded-xl border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2">Linha</th>
                      <th className="p-2">Campo</th>
                      <th className="p-2">Código</th>
                      <th className="p-2">Mensagem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validated.errors.slice(0, 20).map((e, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{e.row}</td>
                        <td className="p-2">{e.field || '-'}</td>
                        <td className="p-2">{e.code}</td>
                        <td className="p-2">{e.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {validated.preview?.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-semibold">Preview (até 200 linhas)</div>
              <div className="mt-2 overflow-auto rounded-xl border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2">Linha</th>
                      <th className="p-2">SKU</th>
                      <th className="p-2">Nome</th>
                      <th className="p-2">Unidade</th>
                      <th className="p-2">Mínimo</th>
                      <th className="p-2">Preço</th>
                      <th className="p-2">Estoque inicial</th>
                      <th className="p-2">Custo inicial</th>
                      <th className="p-2">Categoria</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validated.preview.slice(0, 30).map((r, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{r.row}</td>
                        <td className="p-2">{r.sku || '-'}</td>
                        <td className="p-2">{r.name}</td>
                        <td className="p-2">{r.unitCode}</td>
                        <td className="p-2">{r.minStock ?? '-'}</td>
                        <td className="p-2">{r.sellPrice ?? '-'}</td>
                        <td className="p-2">{r.initialQty ?? '-'}</td>
                        <td className="p-2">{r.initialUnitCost ?? '-'}</td>
                        <td className="p-2">{r.category ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 text-xs text-gray-600">Mostrando até 30 linhas na tabela (preview guarda até 200).</div>
            </div>
          )}
        </Card>
      )}

      {committed && (
        <Card title="3) Concluído">
          <pre className="rounded-xl bg-gray-50 p-3 text-xs">{JSON.stringify(committed, null, 2)}</pre>
        </Card>
      )}
    </div>
  );
}

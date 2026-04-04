import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { api, apiDownload } from '../../services/api';
import { useToast } from '../../app/providers/ToastProvider';

type ProductForm = {
  name: string;
  sku: string;
  unitId: string;
  lowStockThreshold: string;
  sellPrice: string;
};

const emptyForm: ProductForm = {
  name: '',
  sku: '',
  unitId: '',
  lowStockThreshold: '',
  sellPrice: '',
};

export default function Products() {
  const toast = useToast();
  const [units, setUnits] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState('');
  const [csv, setCsv] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  async function refresh(include = includeArchived) {
    setErr('');
    try {
      const [u, p] = await Promise.all([
        api('/units'),
        api(`/products?includeArchived=${include ? 'true' : 'false'}`),
      ]);
      setUnits(u);
      setItems(p);
      setForm((curr) => ({ ...curr, unitId: curr.unitId || u?.[0]?.id || '' }));
    } catch (e: any) {
      setErr(e.message || 'Erro');
    }
  }

  useEffect(() => { refresh(includeArchived); }, [includeArchived]);

  function setField<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((curr) => ({ ...curr, [key]: value }));
  }

  function startEdit(item: any) {
    setEditingId(item.id);
    setForm({
      name: item.name || '',
      sku: item.sku || '',
      unitId: item.unitId || item.unit?.id || units?.[0]?.id || '',
      lowStockThreshold: item.lowStockThreshold != null ? String(item.lowStockThreshold) : '',
      sellPrice: item.sellPrice != null ? String(item.sellPrice) : '',
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm({ ...emptyForm, unitId: units?.[0]?.id || '' });
  }

  async function save() {
    setErr('');
    try {
      const payload = {
        name: form.name,
        sku: form.sku || null,
        unitId: form.unitId,
        lowStockThreshold: form.lowStockThreshold ? Number(form.lowStockThreshold) : null,
        sellPrice: form.sellPrice ? Number(form.sellPrice) : null,
      };
      if (editingId) {
        await api(`/products/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.push({ type: 'success', message: 'Produto atualizado.' });
      } else {
        await api('/products', { method: 'POST', body: JSON.stringify(payload) });
        toast.push({ type: 'success', message: 'Produto criado.' });
      }
      resetForm();
      await refresh();
    } catch (e: any) {
      setErr(e.message || 'Erro');
    }
  }

  async function toggleArchive(item: any) {
    setErr('');
    try {
      await api(`/products/${item.id}/${item.isActive === false ? 'unarchive' : 'archive'}`, { method: 'PATCH' });
      toast.push({ type: 'info', message: item.isActive === false ? 'Produto reativado.' : 'Produto arquivado.' });
      if (editingId === item.id) resetForm();
      await refresh(true);
    } catch (e: any) {
      setErr(e.message || 'Erro');
    }
  }

  async function downloadCsv() {
    try {
      const res = await apiDownload('/products/csv/export.csv');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setErr(e.message || 'Erro ao exportar CSV');
    }
  }

  async function importCsv() {
    setErr('');
    try {
      const r = await api('/products/csv/import', { method: 'POST', body: JSON.stringify({ csv }) });
      toast.push({ type: 'info', message: `Import: ${r.created} criados, ${r.updated} atualizados.` });
      setCsv('');
      await refresh();
    } catch (e: any) {
      setErr(e.message || 'Erro');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Produtos</h1>
          <p className="text-sm text-gray-600">Cadastro, edição, arquivamento e importação.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={includeArchived} onChange={(e) => setIncludeArchived(e.target.checked)} />
            Mostrar arquivados
          </label>
          <Button variant="ghost" onClick={downloadCsv}>Exportar CSV</Button>
        </div>
      </div>

      {err && <Alert type="error">{err}</Alert>}

      <Card title={isEditing ? 'Editar produto' : 'Novo produto'}>
        <div className="grid gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-gray-600">Nome</label>
            <Input value={form.name} onChange={(e: any) => setField('name', e.target.value)} placeholder="Ex: Arroz" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">SKU</label>
            <Input value={form.sku} onChange={(e: any) => setField('sku', e.target.value)} placeholder="Ex: ARZ-001" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Unidade</label>
            <select value={form.unitId} onChange={(e) => setField('unitId', e.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-900">
              {units.map((u) => <option key={u.id} value={u.id}>{u.code} — {u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Baixo estoque</label>
            <Input value={form.lowStockThreshold} onChange={(e: any) => setField('lowStockThreshold', e.target.value)} placeholder="Ex: 5" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Preço padrão</label>
            <Input value={form.sellPrice} onChange={(e: any) => setField('sellPrice', e.target.value)} placeholder="Ex: 12.99" />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button onClick={save} disabled={!form.name.trim() || !form.unitId}>{isEditing ? 'Salvar alterações' : 'Adicionar'}</Button>
          {isEditing && <Button variant="ghost" onClick={resetForm}>Cancelar</Button>}
        </div>
      </Card>

      <Card title="Importar CSV (cole aqui)">
        <textarea value={csv} onChange={(e) => setCsv(e.target.value)} className="mt-2 h-28 w-full rounded-xl border border-gray-300 p-3 text-xs font-mono outline-none focus:border-gray-900" placeholder="name,sku,unitCode,lowStockThreshold,sellPrice
Arroz,,kg,10,12.99" />
        <div className="mt-3"><Button onClick={importCsv} disabled={!csv.trim()}>Importar</Button></div>
      </Card>

      <Card title={`Lista (${items.length})`}>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-gray-500">
              <tr><th className="py-2">Nome</th><th>Unidade</th><th>Baixo</th><th>Preço</th><th>Status</th><th className="text-right">Ações</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((p) => (
                <tr key={p.id} className={p.isActive === false ? 'opacity-70' : ''}>
                  <td className="py-2 font-semibold">{p.name}<div className="text-xs font-normal text-gray-500">{p.sku || 'Sem SKU'}</div></td>
                  <td className="text-gray-700">{p.unit?.code}</td>
                  <td className="text-gray-700">{p.lowStockThreshold ?? '—'}</td>
                  <td className="text-gray-700">{p.sellPrice ?? '—'}</td>
                  <td>
                    {p.isActive === false ? (
                      <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-700">Arquivado</span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Ativo</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => startEdit(p)}>Editar</Button>
                      <Button variant={p.isActive === false ? 'primary' : 'danger'} onClick={() => toggleArchive(p)}>
                        {p.isActive === false ? 'Reativar' : 'Arquivar'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="py-3 text-gray-500">Sem produtos. Cadastre o primeiro.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

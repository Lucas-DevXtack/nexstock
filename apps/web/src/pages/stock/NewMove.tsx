import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { api } from '../../services/api';

export default function NewMove() {
  const [products, setProducts] = useState<any[]>([]);
  const [productId, setProductId] = useState('');
  const [type, setType] = useState<'IN'|'OUT'>('IN');
  const [reason, setReason] = useState<'SALE'|'LOSS'|'TRANSFER'|'OTHER'>('SALE');
  const [occurredAt, setOccurredAt] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitCost, setUnitCost] = useState('10');
  const [unitPrice, setUnitPrice] = useState('20');
  const [expiresAt, setExpiresAt] = useState('');
  const [batchCode, setBatchCode] = useState('');
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');
  const [okMsg, setOkMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const p = await api('/products');
        setProducts(p);
        if (p?.[0]?.id) setProductId(p[0].id);
      } catch (e: any) {
        setErr(e.message || 'Erro');
      }
    })();
  }, []);

  async function submit() {
    setErr(''); setOkMsg('');
    try {
      const body: any = { productId, type, quantity: Number(quantity), note };
      if (occurredAt) body.occurredAt = occurredAt;
      if (type === 'IN') {
        body.unitCost = Number(unitCost);
        if (expiresAt) body.expiresAt = expiresAt;
        if (batchCode) body.batchCode = batchCode;
      } else {
        // OUT
        body.reason = reason;
        if (reason === 'SALE') {
          if (!unitPrice) throw new Error('Preço unitário é obrigatório para venda (SALE).');
          body.unitPrice = Number(unitPrice);
        } else {
          if (unitPrice) body.unitPrice = Number(unitPrice);
        }
      }
      await api('/pro/stock/move', { method: 'POST', body: JSON.stringify(body) });
      setOkMsg('Movimentação registrada (FIFO).');
    } catch (e: any) {
      setErr(e.message || 'Erro');
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Movimentar estoque</h1>
        <p className="text-sm text-gray-600">FIFO + vendas ligadas ao caixa (INCOME).</p>
      </div>

      {err && <Alert type="error">{err}</Alert>}
      {okMsg && <Alert type="info">{okMsg}</Alert>}

      <Card title="Nova movimentação">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-gray-600">Produto</label>
            <select value={productId} onChange={(e) => setProductId(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-900">
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value as any)} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-900">
              <option value="IN">Entrada (IN)</option>
              <option value="OUT">Saída (OUT)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Data (opcional)</label>
            <Input value={occurredAt} onChange={(e: any) => setOccurredAt(e.target.value)} placeholder="2026-02-13T10:30:00" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600">Quantidade</label>
            <Input value={quantity} onChange={(e: any) => setQuantity(e.target.value)} />
          </div>

          {type === 'IN' ? (
            <div>
              <label className="text-xs font-semibold text-gray-600">Custo unitário (IN)</label>
              <Input value={unitCost} onChange={(e: any) => setUnitCost(e.target.value)} />
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-600">Motivo (OUT)</label>
                <select value={reason} onChange={(e) => setReason(e.target.value as any)} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-900">
                  <option value="SALE">Venda (SALE)</option>
                  <option value="LOSS">Perda / Quebra (LOSS)</option>
                  <option value="TRANSFER">Transferência (TRANSFER)</option>
                  <option value="OTHER">Outro (OTHER)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Preço unitário {reason === 'SALE' ? '(obrigatório)' : '(opcional)'}</label>
                <Input value={unitPrice} onChange={(e: any) => setUnitPrice(e.target.value)} />
              </div>
            </>
          )}

          {type === 'IN' && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-600">Validade (opcional)</label>
                <Input value={expiresAt} onChange={(e: any) => setExpiresAt(e.target.value)} placeholder="2026-12-31" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Lote (opcional)</label>
                <Input value={batchCode} onChange={(e: any) => setBatchCode(e.target.value)} placeholder="L-001" />
              </div>
            </>
          )}

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-gray-600">Nota</label>
            <Input value={note} onChange={(e: any) => setNote(e.target.value)} placeholder="Opcional" />
          </div>
        </div>
        <div className="mt-3"><Button onClick={submit} disabled={!productId}>Salvar</Button></div>
      </Card>
    </div>
  );
}

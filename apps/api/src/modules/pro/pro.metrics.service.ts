import { prisma } from '../../shared/db/prisma.js';
import { Decimal } from '@prisma/client/runtime/library';

function D(v: any) { return new Decimal(v); }
const DAY_MS = 24 * 60 * 60 * 1000;

type MoveRow = {
  productId: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  reason: 'SALE' | 'ADJUST' | 'LOSS' | 'TRANSFER' | 'OTHER' | null;
  quantity: Decimal;
  unitPrice: Decimal | null;
  occurredAt: Date;
  allocations: { quantity: Decimal; unitCost: Decimal }[];
};

function addDaysPortion(ms: number) {
  return ms / DAY_MS;
}

export async function productMetrics(tenantId: string, days: number = 30) {
  const now = new Date();
  const since = new Date(Date.now() - days * DAY_MS);

  const products = await prisma.product.findMany({
    where: { tenantId },
    include: { unit: true },
  });

  // Current inventory from lots (FIFO remain)
  const lots = await prisma.stockLot.findMany({
    where: { tenantId, qtyRemain: { gt: 0 } },
  });

  const invMap = new Map<string, { qty: Decimal; value: Decimal }>();
  for (const lot of lots) {
    const cur = invMap.get(lot.productId) || { qty: D(0), value: D(0) };
    cur.qty = cur.qty.plus(lot.qtyRemain as any);
    cur.value = cur.value.plus((lot.qtyRemain as any).mul(lot.unitCost as any));
    invMap.set(lot.productId, cur);
  }

  // Moves in window for rupture + sales/COGS
  const moves: MoveRow[] = await prisma.stockMove.findMany({
    where: { tenantId, occurredAt: { gte: since, lte: now } },
    select: {
      productId: true,
      type: true,
      reason: true,
      quantity: true,
      unitPrice: true,
      occurredAt: true,
      allocations: { select: { quantity: true, unitCost: true } },
    },
    orderBy: [{ occurredAt: 'asc' }, { id: 'asc' }],
  }) as any;

  // Aggregate sales + COGS (only SALE)
  const salesMap = new Map<string, { revenue: Decimal; cogs: Decimal; soldQty: Decimal }>();
  // Aggregate net qty (for qty at start of window)
  const netQtyMap = new Map<string, Decimal>();

  for (const m of moves) {
    const q = m.quantity as any as Decimal;

    // net qty
    const curNet = netQtyMap.get(m.productId) || D(0);
    const delta = (m.type === 'IN' || m.type === 'ADJUST') ? q : q.mul(-1);
    netQtyMap.set(m.productId, curNet.plus(delta));

    // sale metrics
    if (m.type === 'OUT' && m.reason === 'SALE') {
      const cur = salesMap.get(m.productId) || { revenue: D(0), cogs: D(0), soldQty: D(0) };
      cur.soldQty = cur.soldQty.plus(q);
      if (m.unitPrice) cur.revenue = cur.revenue.plus((m.unitPrice as any).mul(q));
      let cogs = D(0);
      for (const a of m.allocations) cogs = cogs.plus((a.quantity as any).mul(a.unitCost as any));
      cur.cogs = cur.cogs.plus(cogs);
      salesMap.set(m.productId, cur);
    }
  }

  // Helper: per-product rupture pct based on piecewise constant qty between moves
  const movesByProduct = new Map<string, MoveRow[]>();
  for (const m of moves) {
    const list = movesByProduct.get(m.productId) || [];
    list.push(m);
    movesByProduct.set(m.productId, list);
  }

  const out = products.map((p) => {
    const invNow = invMap.get(p.id) || { qty: D(0), value: D(0) };
    const netQty = netQtyMap.get(p.id) || D(0);

    // qty at start of window = qtyNow - netChangesInWindow
    const qtyStart = invNow.qty.minus(netQty);
    const costAvgNow = invNow.qty.gt(0) ? invNow.value.div(invNow.qty) : D(0);

    // avg inventory value approximation (start/end valued at current avg cost)
    const invValueStart = qtyStart.gt(0) ? qtyStart.mul(costAvgNow) : D(0);
    const invValueAvg = invValueStart.plus(invNow.value).div(2);

    const s = salesMap.get(p.id) || { revenue: D(0), cogs: D(0), soldQty: D(0) };
    const margin = s.revenue.minus(s.cogs);
    const marginPct = s.revenue.gt(0) ? margin.div(s.revenue).mul(100) : D(0);

    // Giro (dias) = estoque médio / CMV diário  => days * estoque_medio / CMV_periodo
    const turnoverDays = (s.cogs.gt(0) && invValueAvg.gt(0))
      ? D(days).mul(invValueAvg).div(s.cogs)
      : null;

    // Ruptura (% dias abaixo do mínimo) por SKU
    let ruptureDaysPct: number | null = null;
    const threshold = p.lowStockThreshold != null ? D(p.lowStockThreshold as any) : null;
    if (threshold) {
      const pmoves = movesByProduct.get(p.id) || [];
      let qty = qtyStart;
      let belowDays = 0;
      let t = since.getTime();

      for (const m of pmoves) {
        const mt = new Date(m.occurredAt).getTime();
        if (mt < t) continue;

        const segMs = Math.max(0, mt - t);
        if (qty.lt(threshold)) belowDays += addDaysPortion(segMs);

        const q = m.quantity as any as Decimal;
        qty = (m.type === 'IN' || m.type === 'ADJUST') ? qty.plus(q) : qty.minus(q);
        t = mt;
      }

      const tailMs = Math.max(0, now.getTime() - t);
      if (qty.lt(threshold)) belowDays += addDaysPortion(tailMs);

      ruptureDaysPct = days > 0 ? (belowDays / days) * 100 : 0;
    }

    return {
      productId: p.id,
      name: p.name,
      unit: p.unit.code,
      qtyOnHand: Number(invNow.qty),
      immobilizedValue: Number(invNow.value),
      revenue: Number(s.revenue),
      cogs: Number(s.cogs),
      margin: Number(margin),
      marginPct: Number(marginPct),
      turnoverDays: turnoverDays ? Number(turnoverDays) : null,
      ruptureDaysPct,
      lowStockThreshold: p.lowStockThreshold != null ? Number(p.lowStockThreshold) : null,
    };
  });

  return out;
}

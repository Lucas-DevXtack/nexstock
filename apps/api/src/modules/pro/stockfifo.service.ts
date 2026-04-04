import { prisma } from '../../shared/db/prisma.js';
import { HttpError } from '../../shared/http/errors.js';
import { Decimal } from '@prisma/client/runtime/library';

function D(v: any) { return new Decimal(v); }

export async function moveStockFIFO(opts: {
  tenantId: string;
  userId?: string;
  productId: string;
  type: 'IN'|'OUT'|'ADJUST';
  reason?: 'SALE'|'ADJUST'|'LOSS'|'TRANSFER'|'OTHER';
  occurredAt?: string;
  quantity: number;
  unitCost?: number;
  unitPrice?: number;
  note?: string;
  expiresAt?: string;
  batchCode?: string;
}) {
  const qty = D(opts.quantity);
  if (qty.lte(0)) throw new HttpError(400, 'quantity must be > 0');

  const reason = opts.reason ?? ((opts.type === 'OUT' && opts.unitPrice != null) ? 'SALE' : undefined);

  if (opts.type === 'OUT' && reason === 'SALE' && opts.unitPrice == null) {
    throw new HttpError(400, 'unitPrice required when reason=SALE');
  }

  if (opts.type === 'IN') {
    if (opts.unitCost == null) throw new HttpError(400, 'unitCost required for IN');
    const cost = D(opts.unitCost);

    const lot = await prisma.stockLot.create({
      data: {
        tenantId: opts.tenantId,
        productId: opts.productId,
        unitCost: cost,
        qtyInitial: qty,
        qtyRemain: qty,
        expiresAt: opts.expiresAt ? new Date(opts.expiresAt) : undefined,
        batchCode: opts.batchCode,
      },
    });

    const move = await prisma.stockMove.create({
      data: {
        tenantId: opts.tenantId,
        productId: opts.productId,
        type: 'IN',
        reason: reason as any,
        quantity: qty,
        unitCost: cost,
        note: opts.note,
        occurredAt: opts.occurredAt ? new Date(opts.occurredAt) : undefined,
        createdByUserId: opts.userId,
      },
    });

    await prisma.stockLotAllocation.create({
      data: { moveId: move.id, lotId: lot.id, quantity: qty, unitCost: cost },
    });

    return move;
  }

  if (opts.type === 'ADJUST') {
    // positive qty means add stock at avg cost; negative not supported here (use OUT)
    if (opts.unitCost == null) throw new HttpError(400, 'unitCost required for ADJUST');
    const cost = D(opts.unitCost);

    const lot = await prisma.stockLot.create({
      data: { tenantId: opts.tenantId, productId: opts.productId, unitCost: cost, qtyInitial: qty, qtyRemain: qty, batchCode: opts.batchCode },
    });

    const move = await prisma.stockMove.create({
      data: { tenantId: opts.tenantId, productId: opts.productId, type: 'ADJUST', reason: reason as any, quantity: qty, unitCost: cost, note: opts.note, occurredAt: opts.occurredAt ? new Date(opts.occurredAt) : undefined, createdByUserId: opts.userId },
    });

    await prisma.stockLotAllocation.create({ data: { moveId: move.id, lotId: lot.id, quantity: qty, unitCost: cost } });
    return move;
  }

  // OUT: consume FIFO
  const need = qty;
  const lots = await prisma.stockLot.findMany({
    where: { tenantId: opts.tenantId, productId: opts.productId, qtyRemain: { gt: 0 } },
    orderBy: [{ receivedAt: 'asc' }, { id: 'asc' }],
  });

  let remaining = need;
  const allocations: { lotId: string; quantity: Decimal; unitCost: Decimal }[] = [];

  for (const lot of lots) {
    if (remaining.lte(0)) break;
    const take = Decimal.min(lot.qtyRemain, remaining);
    allocations.push({ lotId: lot.id, quantity: take, unitCost: lot.unitCost as any });
    remaining = remaining.minus(take);
  }

  if (remaining.gt(0)) throw new HttpError(409, 'Insufficient stock');

  const move = await prisma.stockMove.create({
    data: {
      tenantId: opts.tenantId,
      productId: opts.productId,
      type: 'OUT',
      reason: (reason as any) ?? 'OTHER',
      quantity: qty,
      unitPrice: opts.unitPrice != null ? D(opts.unitPrice) : undefined,
      note: opts.note,
      occurredAt: opts.occurredAt ? new Date(opts.occurredAt) : undefined,
      createdByUserId: opts.userId,
    },
  });

  // apply allocations and decrement lots
  for (const a of allocations) {
    await prisma.stockLotAllocation.create({ data: { moveId: move.id, lotId: a.lotId, quantity: a.quantity, unitCost: a.unitCost } });
    await prisma.stockLot.update({ where: { id: a.lotId }, data: { qtyRemain: { decrement: a.quantity } } });
  }

  // if sale, create INCOME transaction linked
  if (opts.unitPrice != null) {
    const amount = D(opts.unitPrice).mul(qty);
    const tx = await prisma.transaction.create({
      data: {
        tenantId: opts.tenantId,
        type: 'INCOME' as any,
        amount,
        description: `Venda (produto ${opts.productId})`,
        occurredAt: opts.occurredAt ? new Date(opts.occurredAt) : new Date(),
      },
    });
    await prisma.stockMove.update({ where: { id: move.id }, data: { txIncomeId: tx.id } });
  }

  return move;
}

export async function getStockBalance(tenantId: string) {
  const lots = await prisma.stockLot.findMany({ where: { tenantId, qtyRemain: { gt: 0 } }, include: { product: { include: { unit: true } } } });

  const map = new Map<string, any>();
  for (const lot of lots) {
    const p = lot.product;
    const cur = map.get(p.id) || { productId: p.id, name: p.name, unit: p.unit.code, quantity: new Decimal(0), immobilizedValue: new Decimal(0), costAvg: new Decimal(0) };
    cur.quantity = cur.quantity.plus(lot.qtyRemain);
    cur.immobilizedValue = cur.immobilizedValue.plus((lot.qtyRemain as any).mul(lot.unitCost as any));
    map.set(p.id, cur);
  }
  const out = Array.from(map.values()).map((x) => {
    x.costAvg = x.quantity.gt(0) ? x.immobilizedValue.div(x.quantity) : new Decimal(0);
    return {
      ...x,
      quantity: Number(x.quantity),
      immobilizedValue: Number(x.immobilizedValue),
      costAvg: Number(x.costAvg),
    };
  });

  return out;
}

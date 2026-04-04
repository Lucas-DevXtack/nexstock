import { prisma } from '../../shared/db/prisma.js';
import { Decimal } from '@prisma/client/runtime/library';
import { stringify } from 'csv-stringify/sync';
import PDFDocument from 'pdfkit';
import { productMetrics } from '../pro/pro.metrics.service.js';

function D(v: any) { return new Decimal(v); }

export async function monthlySummary(tenantId: string, year: number, month: number) {
  const start = new Date(Date.UTC(year, month-1, 1, 0,0,0));
  const end = new Date(Date.UTC(year, month, 1, 0,0,0));

  const tx = await prisma.transaction.findMany({ where: { tenantId, occurredAt: { gte: start, lt: end } } });
  let income = D(0), expense = D(0);
  for (const t of tx) {
    if (t.type === 'INCOME') income = income.plus(t.amount as any);
    else expense = expense.plus(t.amount as any);
  }

  // compute COGS from stock moves allocations in period
  const outs = await prisma.stockMove.findMany({ where: { tenantId, type: 'OUT', occurredAt: { gte: start, lt: end } }, include: { allocations: true } });
  let cogs = D(0);
  for (const m of outs) {
    for (const a of m.allocations) cogs = cogs.plus((a.quantity as any).mul(a.unitCost as any));
  }

  const invLots = await prisma.stockLot.findMany({ where: { tenantId, qtyRemain: { gt: 0 } } });
  let invValue = D(0);
  for (const lot of invLots) invValue = invValue.plus((lot.qtyRemain as any).mul(lot.unitCost as any));

  const grossMargin = income.minus(cogs);
  const net = income.minus(expense);

  return {
    period: `${year}-${String(month).padStart(2,'0')}`,
    income: Number(income),
    expense: Number(expense),
    cogs: Number(cogs),
    grossMargin: Number(grossMargin),
    inventoryValue: Number(invValue),
    net: Number(net),
  };
}

export async function annualSummary(tenantId: string, year: number) {
  const rows = [];
  for (let m=1;m<=12;m++) rows.push(await monthlySummary(tenantId, year, m));
  return rows;
}

export function toCSV(rows: any[]) {
  return stringify(rows, { header: true });
}

export function toPDF(title: string, rows: any[]) {
  const doc = new PDFDocument({ margin: 40 });
  const chunks: Buffer[] = [];
  doc.on('data', (d: Buffer) => chunks.push(d));
  return new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.fontSize(18).text(title);
    doc.moveDown();
    doc.fontSize(10);

    const keys = Object.keys(rows[0] || {});
    doc.text(keys.join(' | '));
    doc.moveDown(0.5);
    for (const r of rows) {
      doc.text(keys.map((k) => String(r[k] ?? '')).join(' | '));
    }
    doc.end();
  });
}

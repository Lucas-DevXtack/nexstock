import { prisma } from '../../shared/db/prisma.js';
import { Decimal } from '@prisma/client/runtime/library';
import { stringify } from 'csv-stringify/sync';
import PDFDocument from 'pdfkit';
function D(v) { return new Decimal(v); }
export async function monthlySummary(tenantId, year, month) {
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    const tx = await prisma.transaction.findMany({ where: { tenantId, occurredAt: { gte: start, lt: end } } });
    let income = D(0), expense = D(0);
    for (const t of tx) {
        if (t.type === 'INCOME')
            income = income.plus(t.amount);
        else
            expense = expense.plus(t.amount);
    }
    // compute COGS from stock moves allocations in period
    const outs = await prisma.stockMove.findMany({ where: { tenantId, type: 'OUT', occurredAt: { gte: start, lt: end } }, include: { allocations: true } });
    let cogs = D(0);
    for (const m of outs) {
        for (const a of m.allocations)
            cogs = cogs.plus(a.quantity.mul(a.unitCost));
    }
    const invLots = await prisma.stockLot.findMany({ where: { tenantId, qtyRemain: { gt: 0 } } });
    let invValue = D(0);
    for (const lot of invLots)
        invValue = invValue.plus(lot.qtyRemain.mul(lot.unitCost));
    const grossMargin = income.minus(cogs);
    const net = income.minus(expense);
    return {
        period: `${year}-${String(month).padStart(2, '0')}`,
        income: Number(income),
        expense: Number(expense),
        cogs: Number(cogs),
        grossMargin: Number(grossMargin),
        inventoryValue: Number(invValue),
        net: Number(net),
    };
}
export async function annualSummary(tenantId, year) {
    const rows = [];
    for (let m = 1; m <= 12; m++)
        rows.push(await monthlySummary(tenantId, year, m));
    return rows;
}
export function toCSV(rows) {
    return stringify(rows, { header: true });
}
export function toPDF(title, rows) {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];
    doc.on('data', (d) => chunks.push(d));
    return new Promise((resolve) => {
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

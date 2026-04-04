import { Router } from 'express';
import { prisma } from '../../shared/db/prisma.js';
import { requireAuth } from '../auth/guards/auth.guard.js';
import { requireTenant } from '../../shared/middleware/tenant.middleware.js';
import { loadTenantBilling } from '../billing/billing.middleware.js';
import { requirePerm } from '../members/guards/perm.guard.js';
import { moveStockFIFO } from '../pro/stockfifo.service.js';
export const inventoryRoutes = Router();
inventoryRoutes.use(requireAuth, requireTenant, loadTenantBilling, requirePerm('STOCK_WRITE'));
inventoryRoutes.post('/counts', async (req, res) => {
    const c = await prisma.inventoryCount.create({ data: { tenantId: req.tenantId } });
    res.status(201).json(c);
});
inventoryRoutes.get('/counts', async (req, res) => {
    const rows = await prisma.inventoryCount.findMany({ where: { tenantId: req.tenantId }, orderBy: { startedAt: 'desc' }, take: 20 });
    res.json(rows);
});
inventoryRoutes.get('/counts/:id', async (req, res) => {
    const c = await prisma.inventoryCount.findFirst({ where: { id: req.params.id, tenantId: req.tenantId }, include: { lines: true } });
    res.json(c);
});
inventoryRoutes.post('/counts/:id/lines', async (req, res) => {
    const countId = req.params.id;
    const lines = req.body?.lines || [];
    for (const l of lines) {
        await prisma.inventoryCountLine.upsert({
            where: { countId_productId: { countId, productId: l.productId } },
            update: { countedQty: l.countedQty },
            create: { countId, productId: l.productId, countedQty: l.countedQty },
        });
    }
    res.json({ ok: true });
});
inventoryRoutes.post('/counts/:id/close', async (req, res) => {
    const c = await prisma.inventoryCount.findFirst({ where: { id: req.params.id, tenantId: req.tenantId }, include: { lines: true } });
    if (!c)
        return res.status(404).json({ error: 'not found' });
    if (c.status !== 'OPEN')
        return res.status(409).json({ error: 'already closed' });
    // compute adjustments vs current balance
    const lots = await prisma.stockLot.findMany({ where: { tenantId: req.tenantId, qtyRemain: { gt: 0 } } });
    const cur = new Map();
    for (const lot of lots) {
        const v = cur.get(lot.productId) || { qty: 0, value: 0 };
        v.qty += Number(lot.qtyRemain);
        v.value += Number(lot.qtyRemain) * Number(lot.unitCost);
        cur.set(lot.productId, v);
    }
    for (const line of c.lines) {
        const current = cur.get(line.productId)?.qty || 0;
        const counted = Number(line.countedQty);
        const diff = counted - current;
        if (diff > 0) {
            // add diff as ADJUST at avg cost (or 0 if none)
            const avgCost = cur.get(line.productId)?.value && current > 0 ? (cur.get(line.productId).value / current) : 0;
            await moveStockFIFO({ tenantId: req.tenantId, userId: req.userId, productId: line.productId, type: 'ADJUST', quantity: diff, unitCost: avgCost, note: `Inventário ${c.id}` });
        }
        else if (diff < 0) {
            // remove as OUT (no unitPrice)
            await moveStockFIFO({ tenantId: req.tenantId, userId: req.userId, productId: line.productId, type: 'OUT', quantity: Math.abs(diff), note: `Inventário ${c.id}` });
        }
    }
    await prisma.inventoryCount.update({ where: { id: c.id }, data: { status: 'CLOSED', closedAt: new Date() } });
    res.json({ ok: true });
});

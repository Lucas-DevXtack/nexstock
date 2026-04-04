import { Router } from 'express';
import { requireAuth } from '../auth/guards/auth.guard.js';
import { requireTenant } from '../../shared/middleware/tenant.middleware.js';
import { loadTenantBilling } from '../billing/billing.middleware.js';
import { requirePlan } from '../billing/guards/plan.guard.js';
import { requirePerm } from '../members/guards/perm.guard.js';

import { moveStockFIFO, getStockBalance } from './stockfifo.service.js';
import { productMetrics } from './pro.metrics.service.js';
import { proHealth } from './pro.health.service.js';
import { prisma } from '../../shared/db/prisma.js';
import { audit } from '../../shared/middleware/audit.middleware.js';

export const proRoutes = Router();

proRoutes.use(requireAuth, requireTenant, loadTenantBilling);

// FIFO move (available for all plans; PRO analytics are paywalled)
proRoutes.post(
  '/stock/move',
  requirePerm('STOCK_WRITE'),
  audit('STOCK_MOVE', 'StockMove'),
  async (req, res) => {
    const m = await moveStockFIFO({
      tenantId: req.tenantId!,
      userId: req.userId!,
      productId: req.body.productId,
      type: req.body.type,
      reason: req.body.reason,
      quantity: Number(req.body.quantity),
      unitCost: req.body.unitCost != null ? Number(req.body.unitCost) : undefined,
      unitPrice: req.body.unitPrice != null ? Number(req.body.unitPrice) : undefined,
      note: req.body.note,
      occurredAt: req.body.occurredAt,
      expiresAt: req.body.expiresAt,
      batchCode: req.body.batchCode,
    });
    res.status(201).json(m);
  }
);

proRoutes.get('/stock/balance', requirePerm('STOCK_READ'), async (req, res) => {
  res.json(await getStockBalance(req.tenantId!));
});

// PRO metrics
proRoutes.get('/metrics/products', requirePlan('PRO'), requirePerm('FINANCE_READ'), async (req, res) => {
  const days = req.query.days ? Number(req.query.days) : 30;
  res.json(await productMetrics(req.tenantId!, days));
});

proRoutes.get('/health', requirePlan('PRO'), requirePerm('FINANCE_READ'), async (req, res) => {
  const days = req.query.days ? Number(req.query.days) : 30;
  res.json(await proHealth(req.tenantId!, days));
});

// Low stock notifications creation on demand: recompute and insert missing notifications
proRoutes.post('/notifications/recompute', requirePerm('STOCK_READ'), async (req, res) => {
  const items = await getStockBalance(req.tenantId!);
  const products = await prisma.product.findMany({
    where: { tenantId: req.tenantId!, lowStockThreshold: { not: null } },
  });
  const map = new Map(items.map((i: any) => [i.productId, i]));

  let created = 0;
  for (const p of products) {
    const bal = map.get(p.id);
    if (!bal) continue;
    const threshold = Number(p.lowStockThreshold);
    if (bal.quantity <= threshold) {
      // create a notification if no unread exists
      const exists = await prisma.notification.findFirst({
        where: { tenantId: req.tenantId!, type: 'LOW_STOCK', productId: p.id, readAt: null },
      });
      if (!exists) {
        await prisma.notification.create({
          data: {
            tenantId: req.tenantId!,
            type: 'LOW_STOCK',
            productId: p.id,
            message: `Baixo estoque: ${p.name} (${bal.quantity} <= ${threshold})`,
          },
        });
        created++;
      }
    }
  }
  res.json({ created });
});

proRoutes.get('/notifications', requirePerm('STOCK_READ'), async (req, res) => {
  const rows = await prisma.notification.findMany({
    where: { tenantId: req.tenantId! },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json(rows);
});

proRoutes.post('/notifications/:id/read', requirePerm('STOCK_READ'), async (req, res) => {
  await prisma.notification.update({ where: { id: req.params.id }, data: { readAt: new Date() } });
  res.json({ ok: true });
});

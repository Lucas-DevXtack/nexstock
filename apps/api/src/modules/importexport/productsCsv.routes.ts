import { Router } from 'express';
import { prisma } from '../../shared/db/prisma.js';
import { requireAuth } from '../auth/guards/auth.guard.js';
import { requireTenant } from '../../shared/middleware/tenant.middleware.js';
import { loadTenantBilling } from '../billing/billing.middleware.js';
import { requirePlan } from '../billing/guards/plan.guard.js';
import { requirePerm } from '../members/guards/perm.guard.js';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

export const productsCsvRoutes = Router();
productsCsvRoutes.use(requireAuth, requireTenant, loadTenantBilling, requirePerm('STOCK_WRITE'));

productsCsvRoutes.get('/export.csv', async (req, res) => {
  const items = await prisma.product.findMany({ where: { tenantId: req.tenantId!, isActive: true }, include: { unit: true } });
  const rows = items.map((p) => ({
    name: p.name,
    sku: p.sku || '',
    unitCode: p.unit.code,
    lowStockThreshold: p.lowStockThreshold ? String(p.lowStockThreshold) : '',
    sellPrice: p.sellPrice ? String(p.sellPrice) : '',
  }));
  const csv = stringify(rows, { header: true });
  res.setHeader('Content-Type','text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
  res.send(csv);
});

productsCsvRoutes.post('/import', requirePlan('PRO'), async (req, res) => {
  const csvText = String(req.body?.csv || '');
  if (!csvText.trim()) return res.status(400).json({ error: 'csv required in body.csv' });
  const records = parse(csvText, { columns: true, skip_empty_lines: true, trim: true });
  let created = 0, updated = 0;

  for (const r of records) {
    const unit = await prisma.unit.findUnique({ where: { code: r.unitCode } });
    if (!unit) continue;

    const existing = await prisma.product.findFirst({ where: { tenantId: req.tenantId!, name: r.name } });
    const data: any = {
      tenantId: req.tenantId!,
      name: r.name,
      sku: r.sku || null,
      unitId: unit.id,
      lowStockThreshold: r.lowStockThreshold ? r.lowStockThreshold : null,
      sellPrice: r.sellPrice ? r.sellPrice : null,
      isActive: true,
      archivedAt: null,
    };

    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await prisma.product.create({ data });
      created++;
    }
  }

  res.json({ created, updated });
});

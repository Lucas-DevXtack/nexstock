import { Router } from 'express';
import { requireAuth } from '../auth/guards/auth.guard.js';
import { requireTenant } from '../../shared/middleware/tenant.middleware.js';
import { loadTenantBilling } from '../billing/billing.middleware.js';
import { requirePlan } from '../billing/guards/plan.guard.js';
import { requirePerm } from '../members/guards/perm.guard.js';
import { annualSummary, monthlySummary, toCSV, toPDF } from './reports.service.js';

export const reportsRoutes = Router();
reportsRoutes.use(requireAuth, requireTenant, loadTenantBilling, requirePlan('PRO'), requirePerm('REPORTS_READ'));

reportsRoutes.get('/monthly.csv', async (req, res) => {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  const row = await monthlySummary(req.tenantId!, year, month);
  const csv = toCSV([row]);
  res.setHeader('Content-Type','text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="monthly-${row.period}.csv"`);
  res.send(csv);
});

reportsRoutes.get('/annual.csv', async (req, res) => {
  const year = Number(req.query.year);
  const rows = await annualSummary(req.tenantId!, year);
  const csv = toCSV(rows);
  res.setHeader('Content-Type','text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="annual-${year}.csv"`);
  res.send(csv);
});

reportsRoutes.get('/monthly.pdf', async (req, res) => {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  const row = await monthlySummary(req.tenantId!, year, month);
  const pdf = await toPDF(`Resumo mensal ${row.period}`, [row]);
  res.setHeader('Content-Type','application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="monthly-${row.period}.pdf"`);
  res.send(pdf);
});

reportsRoutes.get('/annual.pdf', async (req, res) => {
  const year = Number(req.query.year);
  const rows = await annualSummary(req.tenantId!, year);
  const pdf = await toPDF(`Resumo anual ${year}`, rows);
  res.setHeader('Content-Type','application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="annual-${year}.pdf"`);
  res.send(pdf);
});

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { fail } from './shared/http/response.js';

import { authRoutes } from './modules/auth/auth.routes.js';
import { tenantsRoutes } from './modules/tenants/tenants.routes.js';
import { onboardingRoutes } from './modules/onboarding/onboarding.routes.js';
import { unitsRoutes } from './modules/units/units.routes.js';
import { productsRoutes } from './modules/products/products.routes.js';
import { stockRoutes } from './modules/stock/stock.routes.js';
import { financeRoutes } from './modules/finance/finance.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { membersRoutes } from './modules/members/members.routes.js';
import { billingRoutes } from './modules/billing/billing.routes.js';
import { proRoutes } from './modules/pro/pro.routes.js';
import { reportsRoutes } from './modules/reports/reports.routes.js';
import { inventoryRoutes } from './modules/inventory/inventory.routes.js';
import { productsCsvRoutes } from './modules/importexport/productsCsv.routes.js';
import { productsXlsxRoutes } from './modules/importexport/productsXlsx.routes.js';
import { healthRoutes } from './modules/health/health.routes.js';
import { auditRoutes } from './modules/audit/audit.routes.js';
import { qrRoutes } from './modules/qr/qr.routes.js';
import { requireAuth } from './modules/auth/guards/auth.guard.js';
import { requireTenant } from './shared/middleware/tenant.middleware.js';
import { requireActiveTenant } from './shared/middleware/tenant-status.middleware.js';
import { attachRequestContext } from './shared/middleware/request-context.middleware.js';
import { requireTenantAccess } from './shared/middleware/tenant-access.middleware.js';

export const app = express();
const allowedOrigins = env.CORS_ORIGIN ?? [];

app.set('trust proxy', 1);
app.use(attachRequestContext);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.error('[cors] blocked origin:', origin);
      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  }),
);

app.use('/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (_req, res) => res.json({ ok: true, env: env.NODE_ENV }));
app.use('/qr', qrRoutes);

app.use('/auth', authRoutes);
app.use('/tenants', tenantsRoutes);
app.use('/onboarding', onboardingRoutes);
app.use('/units', unitsRoutes);
app.use('/products', requireAuth, requireTenant, requireTenantAccess, requireActiveTenant, productsRoutes);
app.use('/stock', requireAuth, requireTenant, requireTenantAccess, requireActiveTenant, stockRoutes);
app.use('/finance', requireAuth, requireTenant, requireTenantAccess, requireActiveTenant, financeRoutes);
app.use('/dashboard', requireAuth, requireTenant, requireTenantAccess, requireActiveTenant, dashboardRoutes);
app.use('/members', membersRoutes);
app.use('/billing', billingRoutes);
app.use('/health', healthRoutes);
app.use('/audit', auditRoutes);
app.use('/pro', requireAuth, requireTenant, requireTenantAccess, requireActiveTenant, proRoutes);
app.use('/reports', requireAuth, requireTenant, requireTenantAccess, requireActiveTenant, reportsRoutes);
app.use('/inventory', requireAuth, requireTenant, requireTenantAccess, requireActiveTenant, inventoryRoutes);
app.use('/products/csv', requireAuth, requireTenant, requireTenantAccess, requireActiveTenant, productsCsvRoutes);
app.use('/products/xlsx', requireAuth, requireTenant, requireTenantAccess, requireActiveTenant, productsXlsxRoutes);

app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = Number(err?.status || 500);

  if (String(err?.message || '').includes('CORS')) {
    return fail(res, 403, 'CORS blocked for this origin');
  }

  if (status >= 400 && status < 500) {
    return fail(res, status, err?.message || 'Request failed');
  }

  console.error('[api] internal error:', {
    requestId: req.requestId,
    path: req.path,
    method: req.method,
    userId: req.userId,
    tenantId: req.tenantId,
    message: err?.message,
    code: err?.code,
    meta: err?.meta,
    stack: err?.stack,
  });
  return fail(res, 500, 'Internal server error');
});

app.use((_req, res) => fail(res, 404, 'Not found'));

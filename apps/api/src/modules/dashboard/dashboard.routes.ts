import { Router } from 'express';
import { requireAuth } from '../auth/guards/auth.guard.js';
import { requireTenant } from '../../shared/middleware/tenant.middleware.js';
import { loadTenantBilling } from '../billing/billing.middleware.js';
import { getDashboard } from './dashboard.controller.js';
export const dashboardRoutes=Router();
dashboardRoutes.get('/',requireAuth,requireTenant,loadTenantBilling,getDashboard);

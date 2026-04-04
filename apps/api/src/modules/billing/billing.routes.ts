import { Router } from 'express';
import express from 'express';
import { requireAuth } from '../auth/guards/auth.guard.js';
import { requireTenant } from '../../shared/middleware/tenant.middleware.js';
import { requireTenantAccess } from '../../shared/middleware/tenant-access.middleware.js';
import { getStatus, postCancel, postCheckout, postPortal, postReconcile, postStartTrial } from './billing.controller.js';
import { mercadoPagoWebhook } from './webhook.controller.js';

export const billingRoutes = Router();

billingRoutes.post('/webhook', express.raw({ type: 'application/json' }), mercadoPagoWebhook);

billingRoutes.get('/status', requireAuth, requireTenant, requireTenantAccess, getStatus);
billingRoutes.post('/checkout', requireAuth, requireTenant, requireTenantAccess, postCheckout);
billingRoutes.post('/portal', requireAuth, requireTenant, requireTenantAccess, postPortal);
billingRoutes.post('/trial', requireAuth, requireTenant, requireTenantAccess, postStartTrial);
billingRoutes.post('/reconcile', requireAuth, requireTenant, requireTenantAccess, postReconcile);
billingRoutes.post('/cancel', requireAuth, requireTenant, requireTenantAccess, postCancel);

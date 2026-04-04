import { Router } from 'express';
import { requireAuth } from '../auth/guards/auth.guard.js';
import { requireTenant } from '../../shared/middleware/tenant.middleware.js';
import { postMove, getStockBalance } from './stock.controller.js';
export const stockRoutes = Router();
stockRoutes.post('/move', requireAuth, requireTenant, postMove);
stockRoutes.get('/balance', requireAuth, requireTenant, getStockBalance);

import { Router } from 'express';
import { requireAuth } from '../auth/guards/auth.guard.js';
import { requireTenant } from '../../shared/middleware/tenant.middleware.js';
import { getProducts, patchArchiveProduct, patchUnarchiveProduct, postProducts, putProducts } from './products.controller.js';

export const productsRoutes = Router();

productsRoutes.get('/', requireAuth, requireTenant, getProducts);
productsRoutes.post('/', requireAuth, requireTenant, postProducts);
productsRoutes.put('/:id', requireAuth, requireTenant, putProducts);
productsRoutes.patch('/:id/archive', requireAuth, requireTenant, patchArchiveProduct);
productsRoutes.patch('/:id/unarchive', requireAuth, requireTenant, patchUnarchiveProduct);

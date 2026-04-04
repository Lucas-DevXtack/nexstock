import { Router } from 'express';
import { requireAuth } from '../auth/guards/auth.guard.js';
import { requireTenant } from '../../shared/middleware/tenant.middleware.js';
import { requireTenantAccess } from '../../shared/middleware/tenant-access.middleware.js';
import { getOnboarding, postOnboarding } from './onboarding.controller.js';
export const onboardingRoutes=Router();
onboardingRoutes.get('/status',requireAuth,requireTenant,requireTenantAccess,getOnboarding);
onboardingRoutes.post('/submit',requireAuth,requireTenant,requireTenantAccess,postOnboarding);

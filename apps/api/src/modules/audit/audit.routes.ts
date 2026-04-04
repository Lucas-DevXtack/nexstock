import { Router } from 'express';
import { requireAuth } from '../auth/guards/auth.guard.js';
import { requireTenant } from '../../shared/middleware/tenant.middleware.js';
import { requirePerm } from '../members/guards/perm.guard.js';
import { getAuditLogs } from './audit.controller.js';

export const auditRoutes = Router();

auditRoutes.get('/', requireAuth, requireTenant, requirePerm('AUDIT_READ' as any), getAuditLogs);

import { Request, Response, NextFunction } from 'express';
import { fail } from '../http/response.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      tenantId?: string;
      plan?: 'FREE'|'PRO'|'BUSINESS';
      flags?: Record<string, boolean>;
      billingStatus?: string | null;
    }
  }
}

export function requireTenant(req: Request, res: Response, next: NextFunction) {
  const tenantId = (req.headers['x-tenant-id'] as string) || '';
  if (!tenantId) return fail(res, 400, 'Missing X-Tenant-Id header');
  req.tenantId = tenantId;
  next();
}

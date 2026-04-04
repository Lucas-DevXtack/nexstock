import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../shared/db/prisma.js';
import { fail } from '../../shared/http/response.js';
import { expireTenantIfNeeded } from './billing.service.js';

export async function loadTenantBilling(req: Request, res: Response, next: NextFunction) {
  try {
    await expireTenantIfNeeded(req.tenantId!);
    const tenant = await prisma.tenant.findUnique({ where: { id: req.tenantId! }, include: { profile: true } });
    if (!tenant) return fail(res, 404, 'Tenant not found');
    req.plan = tenant.plan as any;
    req.billingStatus = tenant.billingStatus ?? tenant.stripeStatus ?? null;
    req.flags = { finance_enabled: Boolean(tenant.profile?.wantsFinance) };
    next();
  } catch (e: any) {
    return fail(res, e.status || 500, e.message || 'Erro ao carregar billing');
  }
}

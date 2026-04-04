import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { fail } from '../http/response.js';

export async function requireTenantAccess(req: Request, res: Response, next: NextFunction) {
  const tenantId = req.tenantId;
  const userId = req.userId;

  if (!tenantId) return fail(res, 400, 'Tenant not selected');
  if (!userId) return fail(res, 401, 'Missing authenticated user');

  const membership = await prisma.tenantMember.findUnique({
    where: { tenantId_userId: { tenantId, userId } },
    select: { role: true },
  });

  if (!membership) return fail(res, 403, 'Você não faz parte desta empresa');

  (req as any).memberRole = membership.role;
  next();
}

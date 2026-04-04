import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../shared/db/prisma.js';
import { fail } from '../../../shared/http/response.js';
import { MemberRole } from '../member-roles.js';

const rank: Record<MemberRole, number> = { OWNER: 2, MANAGER: 1, STAFF: 0 };

export function requireRole(minRole: MemberRole) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.tenantId!;
    const userId = req.userId!;
    const m = await prisma.tenantMember.findUnique({ where: { tenantId_userId: { tenantId, userId } } });
    if (!m) return fail(res, 403, 'Not a tenant member');

    if (rank[m.role as MemberRole] < rank[minRole]) return fail(res, 403, `Requires role ${minRole}`);
    // expose role
    (req as any).memberRole = m.role;
    next();
  };
}

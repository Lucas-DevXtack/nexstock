import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../shared/db/prisma.js';
import { fail } from '../../../shared/http/response.js';
import { PermissionKey } from '@prisma/client';
import { MemberRole } from '../member-roles.js';

const rolePerms: Record<MemberRole, Set<PermissionKey>> = {
  OWNER: new Set([
    'STOCK_READ','STOCK_WRITE','FINANCE_READ','FINANCE_WRITE','REPORTS_READ','REPORTS_EXPORT',
    'TEAM_READ','TEAM_INVITE','SETTINGS_READ','SETTINGS_WRITE','AUDIT_READ',
  ] as any),
  MANAGER: new Set([
    'STOCK_READ','STOCK_WRITE','FINANCE_READ','FINANCE_WRITE','REPORTS_READ','REPORTS_EXPORT',
    'TEAM_READ','TEAM_INVITE','SETTINGS_READ',
  ] as any),
  STAFF: new Set(['STOCK_READ','STOCK_WRITE','FINANCE_READ','REPORTS_READ'] as any),
};

export function requirePerm(key: PermissionKey) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.tenantId!;
    const userId = req.userId!;
    const member = await prisma.tenantMember.findUnique({ where: { tenantId_userId: { tenantId, userId } } });
    if (!member) return fail(res, 403, 'Not a tenant member');

    // user overrides
    const override = await prisma.memberPermission.findUnique({
      where: { tenantId_userId_key: { tenantId, userId, key } },
    });
    const allowed = override ? override.allowed : rolePerms[member.role as MemberRole].has(key);

    if (!allowed) return fail(res, 403, `Missing permission ${key}`);
    (req as any).memberRole = member.role;
    next();
  };
}

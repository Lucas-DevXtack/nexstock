import { prisma } from '../db/prisma.js';

export async function logAction(input: {
  tenantId: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  meta?: unknown;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        meta: input.meta as any,
      },
    });
  } catch (err) {
    console.error('[audit] failed to write audit log', err);
  }
}

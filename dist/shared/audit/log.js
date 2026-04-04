import { prisma } from '../db/prisma.js';
export async function logAction(input) {
    try {
        await prisma.auditLog.create({
            data: {
                tenantId: input.tenantId,
                userId: input.userId ?? null,
                action: input.action,
                entity: input.entity,
                entityId: input.entityId ?? null,
                meta: input.meta,
            },
        });
    }
    catch (err) {
        console.error('[audit] failed to write audit log', err);
    }
}

import { prisma } from '../../shared/db/prisma.js';
import { HttpError } from '../../shared/http/errors.js';
export async function listAuditLogs(tenantId, userId, query) {
    const member = await prisma.tenantMember.findUnique({ where: { tenantId_userId: { tenantId, userId } } });
    if (!member)
        throw new HttpError(403, 'Você não faz parte desta empresa');
    const where = { tenantId };
    if (query?.action)
        where.action = query.action;
    if (query?.entity)
        where.entity = query.entity;
    if (query?.search) {
        where.OR = [
            { action: { contains: query.search, mode: 'insensitive' } },
            { entity: { contains: query.search, mode: 'insensitive' } },
            { entityId: { contains: query.search, mode: 'insensitive' } },
        ];
    }
    const rows = await prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
    });
    return rows.map((r) => ({
        id: r.id,
        action: r.action,
        entity: r.entity,
        entityId: r.entityId,
        meta: r.meta,
        createdAt: r.createdAt,
        actor: r.user ? { id: r.user.id, name: r.user.name, email: r.user.email } : null,
    }));
}

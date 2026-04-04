import { prisma } from '../../shared/db/prisma.js';
import { HttpError } from '../../shared/http/errors.js';
import { logAction } from '../../shared/audit/log.js';
async function assertOwner(tenantId, userId) {
    const member = await prisma.tenantMember.findUnique({
        where: { tenantId_userId: { tenantId, userId } },
    });
    if (!member)
        throw new HttpError(403, 'Você não faz parte desta empresa');
    if (member.role !== 'OWNER')
        throw new HttpError(403, 'Apenas o dono pode executar esta ação');
    return member;
}
export async function createTenant(ownerUserId, name) {
    const trimmed = String(name || '').trim();
    if (trimmed.length < 2)
        throw new HttpError(400, 'Nome obrigatório');
    const tenant = await prisma.tenant.create({
        data: {
            name: trimmed,
            members: { create: { userId: ownerUserId, role: 'OWNER' } },
            settings: { create: {} },
        },
        include: { profile: true, settings: true, members: true },
    });
    await logAction({ tenantId: tenant.id, userId: ownerUserId, action: 'TENANT_CREATED', entity: 'TENANT', entityId: tenant.id, meta: { name: tenant.name } });
    return tenant;
}
export async function getTenantById(tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, include: { profile: true, settings: true } });
    if (!tenant)
        throw new HttpError(404, 'Empresa não encontrada');
    return tenant;
}
export async function listTenantsForUser(userId) {
    const rows = await prisma.tenantMember.findMany({
        where: { userId },
        include: { tenant: { include: { profile: true } } },
        orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({
        tenantId: r.tenantId,
        role: r.role,
        name: r.tenant.name,
        plan: r.tenant.plan,
        status: r.tenant.status,
        onboardingCompleted: Boolean(r.tenant.profile),
        wantsFinance: Boolean(r.tenant.profile?.wantsFinance),
        businessType: r.tenant.profile?.businessType ?? null,
    }));
}
export async function renameTenant(tenantId, userId, name) {
    await assertOwner(tenantId, userId);
    const trimmed = String(name || '').trim();
    if (!trimmed)
        throw new HttpError(400, 'Nome obrigatório');
    const tenant = await prisma.tenant.update({ where: { id: tenantId }, data: { name: trimmed } });
    await logAction({ tenantId, userId, action: 'TENANT_RENAMED', entity: 'TENANT', entityId: tenantId, meta: { name: trimmed } });
    return tenant;
}
export async function archiveTenant(tenantId, userId) {
    await assertOwner(tenantId, userId);
    const tenant = await prisma.tenant.update({
        where: { id: tenantId },
        data: { status: 'ARCHIVED', archivedAt: new Date() },
    });
    await logAction({ tenantId, userId, action: 'TENANT_ARCHIVED', entity: 'TENANT', entityId: tenantId });
    return tenant;
}
export async function reactivateTenant(tenantId, userId) {
    await assertOwner(tenantId, userId);
    const tenant = await prisma.tenant.update({
        where: { id: tenantId },
        data: { status: 'ACTIVE', archivedAt: null, closedAt: null },
    });
    await logAction({ tenantId, userId, action: 'TENANT_REACTIVATED', entity: 'TENANT', entityId: tenantId });
    return tenant;
}
export async function closeTenant(tenantId, userId) {
    await assertOwner(tenantId, userId);
    const tenant = await prisma.tenant.update({
        where: { id: tenantId },
        data: {
            status: 'CLOSED',
            closedAt: new Date(),
            plan: 'FREE',
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeStatus: 'inactive',
            stripeCurrentPeriodEnd: null,
            billingSubscriptionId: null,
            billingCustomerId: null,
            billingExternalRef: null,
            billingStatus: 'CANCELED',
            billingCheckoutUrl: null,
            billingCurrentPeriodEnd: null,
            billingTrialEndsAt: null,
        },
    });
    await logAction({ tenantId, userId, action: 'TENANT_CLOSED', entity: 'TENANT', entityId: tenantId });
    return tenant;
}
export async function getTenantPolicy(tenantId, userId) {
    const member = await prisma.tenantMember.findUnique({ where: { tenantId_userId: { tenantId, userId } } });
    if (!member)
        throw new HttpError(403, 'Você não faz parte desta empresa');
    const perms = await prisma.memberPermission.findMany({ where: { tenantId, userId } });
    return {
        role: member.role,
        isOwner: member.role === 'OWNER',
        canRenameCompany: member.role === 'OWNER',
        canArchiveCompany: member.role === 'OWNER',
        canCloseCompany: member.role === 'OWNER',
        canManageTeam: member.role === 'OWNER' || member.role === 'MANAGER',
        permissionOverrides: perms,
    };
}

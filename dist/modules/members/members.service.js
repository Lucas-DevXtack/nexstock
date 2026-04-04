import crypto from 'crypto';
import { prisma } from '../../shared/db/prisma.js';
import { HttpError } from '../../shared/http/errors.js';
// Local enum to avoid runtime failure if Prisma enum isn't present in generated client
var InviteStatus;
(function (InviteStatus) {
    InviteStatus["PENDING"] = "PENDING";
    InviteStatus["ACCEPTED"] = "ACCEPTED";
    InviteStatus["REVOKED"] = "REVOKED";
})(InviteStatus || (InviteStatus = {}));
import { buildInviteLink, sendMail, smtpEnabled } from '../../shared/mailer/mailer.js';
import { logAction } from '../../shared/audit/log.js';
export async function listMembers(tenantId) {
    const rows = await prisma.tenantMember.findMany({
        where: { tenantId },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => ({
        userId: r.userId,
        name: r.user.name,
        email: r.user.email,
        role: r.role,
        createdAt: r.createdAt,
        isCurrentUser: false,
    }));
}
export async function listInvites(tenantId) {
    return prisma.tenantInvite.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, role: true, token: true, status: true, createdAt: true, acceptedAt: true },
    });
}
export async function createInvite(tenantId, invitedByUserId, email, role) {
    email = String(email || '').trim().toLowerCase();
    if (!email)
        throw new HttpError(400, 'email required');
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        const already = await prisma.tenantMember.findUnique({
            where: { tenantId_userId: { tenantId, userId: existingUser.id } },
        });
        if (already)
            throw new HttpError(409, 'User already a member');
    }
    const pending = await prisma.tenantInvite.findFirst({ where: { tenantId, email, status: InviteStatus.PENDING } });
    if (pending)
        throw new HttpError(409, 'Already has a pending invite');
    const token = crypto.randomBytes(24).toString('hex');
    const invite = await prisma.tenantInvite.create({
        data: { tenantId, invitedByUserId, email, role, token },
        select: { id: true, email: true, role: true, token: true, status: true, createdAt: true, acceptedAt: true },
    });
    const link = buildInviteLink(token);
    try {
        await sendMail({
            to: email,
            subject: 'Convite para acessar o NexStock',
            text: `Você foi convidado para acessar uma empresa no NexStock. Abra o link: ${link}`,
            html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <h2>Convite NexStock</h2>
          <p>Você foi convidado para acessar uma empresa no NexStock.</p>
          <p><a href="${link}">Clique aqui para aceitar o convite</a></p>
          <p>Se o botão não abrir, copie e cole no navegador:</p>
          <p><code>${link}</code></p>
        </div>
      `,
        });
    }
    catch {
        // best-effort
    }
    await logAction({ tenantId, userId: invitedByUserId, action: 'INVITE_CREATED', entity: 'TENANT_INVITE', entityId: invite.id, meta: { email, role } });
    return { ...invite, link, emailSent: smtpEnabled() };
}
export async function revokeInvite(tenantId, inviteId) {
    const inv = await prisma.tenantInvite.findFirst({ where: { id: inviteId, tenantId } });
    if (!inv)
        throw new HttpError(404, 'Invite not found');
    if (inv.status !== InviteStatus.PENDING)
        throw new HttpError(409, 'Only pending invites can be revoked');
    const updated = await prisma.tenantInvite.update({ where: { id: inviteId }, data: { status: InviteStatus.REVOKED } });
    await logAction({ tenantId, action: 'INVITE_REVOKED', entity: 'TENANT_INVITE', entityId: inviteId, meta: { email: inv.email } });
    return updated;
}
export async function acceptInvite(userId, token) {
    token = String(token || '').trim();
    if (!token)
        throw new HttpError(400, 'token required');
    const inv = await prisma.tenantInvite.findUnique({ where: { token } });
    if (!inv || inv.status !== InviteStatus.PENDING)
        throw new HttpError(404, 'Invite not found');
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new HttpError(404, 'User not found');
    if (user.email.toLowerCase() !== inv.email.toLowerCase())
        throw new HttpError(403, 'Invite email mismatch');
    await prisma.tenantMember.upsert({
        where: { tenantId_userId: { tenantId: inv.tenantId, userId } },
        update: { role: inv.role },
        create: { tenantId: inv.tenantId, userId, role: inv.role },
    });
    await prisma.tenantInvite.update({
        where: { id: inv.id },
        data: { status: InviteStatus.ACCEPTED, acceptedAt: new Date() },
    });
    await logAction({ tenantId: inv.tenantId, userId, action: 'INVITE_ACCEPTED', entity: 'TENANT_INVITE', entityId: inv.id, meta: { role: inv.role } });
    return { tenantId: inv.tenantId, role: inv.role };
}
export async function transferOwnership(tenantId, actorUserId, targetUserId) {
    if (actorUserId === targetUserId)
        throw new HttpError(400, 'Escolha outro membro para receber a propriedade');
    const actor = await prisma.tenantMember.findUnique({ where: { tenantId_userId: { tenantId, userId: actorUserId } } });
    if (!actor || actor.role !== 'OWNER')
        throw new HttpError(403, 'Só o dono pode transferir ownership');
    const target = await prisma.tenantMember.findUnique({ where: { tenantId_userId: { tenantId, userId: targetUserId } } });
    if (!target)
        throw new HttpError(404, 'Membro não encontrado');
    await prisma.$transaction([
        prisma.tenantMember.update({ where: { tenantId_userId: { tenantId, userId: actorUserId } }, data: { role: 'MANAGER' } }),
        prisma.tenantMember.update({ where: { tenantId_userId: { tenantId, userId: targetUserId } }, data: { role: 'OWNER' } }),
    ]);
    await logAction({ tenantId, userId: actorUserId, action: 'OWNERSHIP_TRANSFERRED', entity: 'TENANT_MEMBER', entityId: targetUserId, meta: { fromUserId: actorUserId, toUserId: targetUserId } });
    return { ok: true };
}
export async function removeMember(tenantId, actorUserId, targetUserId) {
    if (actorUserId === targetUserId)
        throw new HttpError(400, 'Use sair da empresa para remover a si mesmo');
    const actor = await prisma.tenantMember.findUnique({ where: { tenantId_userId: { tenantId, userId: actorUserId } } });
    if (!actor)
        throw new HttpError(403, 'Você não faz parte desta empresa');
    const target = await prisma.tenantMember.findUnique({ where: { tenantId_userId: { tenantId, userId: targetUserId } } });
    if (!target)
        throw new HttpError(404, 'Membro não encontrado');
    if (actor.role === 'STAFF')
        throw new HttpError(403, 'Sem permissão');
    if (actor.role === 'MANAGER' && target.role !== 'STAFF')
        throw new HttpError(403, 'Manager só pode remover STAFF');
    if (target.role === 'OWNER') {
        const owners = await prisma.tenantMember.count({ where: { tenantId, role: 'OWNER' } });
        if (owners <= 1)
            throw new HttpError(409, 'A empresa precisa manter ao menos um OWNER');
    }
    await prisma.$transaction([
        prisma.memberPermission.deleteMany({ where: { tenantId, userId: targetUserId } }),
        prisma.tenantMember.delete({ where: { tenantId_userId: { tenantId, userId: targetUserId } } }),
    ]);
    await logAction({ tenantId, userId: actorUserId, action: 'MEMBER_REMOVED', entity: 'TENANT_MEMBER', entityId: targetUserId, meta: { removedRole: target.role } });
    return { ok: true };
}
export async function leaveCompany(tenantId, userId) {
    const member = await prisma.tenantMember.findUnique({ where: { tenantId_userId: { tenantId, userId } } });
    if (!member)
        throw new HttpError(404, 'Membro não encontrado');
    if (member.role === 'OWNER') {
        const owners = await prisma.tenantMember.count({ where: { tenantId, role: 'OWNER' } });
        if (owners <= 1)
            throw new HttpError(409, 'Transfira a propriedade antes de sair da empresa');
    }
    await prisma.$transaction([
        prisma.memberPermission.deleteMany({ where: { tenantId, userId } }),
        prisma.tenantMember.delete({ where: { tenantId_userId: { tenantId, userId } } }),
    ]);
    await logAction({ tenantId, userId, action: 'MEMBER_LEFT_COMPANY', entity: 'TENANT_MEMBER', entityId: userId, meta: { role: member.role } });
    return { ok: true };
}
export async function updateMemberRole(tenantId, actorUserId, targetUserId, role) {
    const actor = await prisma.tenantMember.findUnique({ where: { tenantId_userId: { tenantId, userId: actorUserId } } });
    if (!actor || actor.role !== 'OWNER')
        throw new HttpError(403, 'Só o dono pode alterar cargos');
    const target = await prisma.tenantMember.findUnique({ where: { tenantId_userId: { tenantId, userId: targetUserId } } });
    if (!target)
        throw new HttpError(404, 'Membro não encontrado');
    if (target.role === 'OWNER' && role !== 'OWNER') {
        const owners = await prisma.tenantMember.count({ where: { tenantId, role: 'OWNER' } });
        if (owners <= 1)
            throw new HttpError(409, 'A empresa precisa manter ao menos um OWNER');
    }
    const updated = await prisma.tenantMember.update({
        where: { tenantId_userId: { tenantId, userId: targetUserId } },
        data: { role },
    });
    await logAction({ tenantId, userId: actorUserId, action: 'MEMBER_ROLE_UPDATED', entity: 'TENANT_MEMBER', entityId: targetUserId, meta: { role } });
    return updated;
}
export async function setMemberPermissions(tenantId, actorUserId, targetUserId, permissions) {
    const actor = await prisma.tenantMember.findUnique({ where: { tenantId_userId: { tenantId, userId: actorUserId } } });
    if (!actor || actor.role !== 'OWNER')
        throw new HttpError(403, 'Só o dono pode ajustar permissões');
    const target = await prisma.tenantMember.findUnique({ where: { tenantId_userId: { tenantId, userId: targetUserId } } });
    if (!target)
        throw new HttpError(404, 'Membro não encontrado');
    if (target.role === 'OWNER')
        throw new HttpError(409, 'Não edite permissões do OWNER por override');
    const validKeys = new Set(['STOCK_READ', 'STOCK_WRITE', 'FINANCE_READ', 'FINANCE_WRITE', 'REPORTS_READ', 'REPORTS_EXPORT', 'TEAM_READ', 'TEAM_INVITE', 'SETTINGS_READ', 'SETTINGS_WRITE', 'AUDIT_READ']);
    await prisma.$transaction(async (tx) => {
        await tx.memberPermission.deleteMany({ where: { tenantId, userId: targetUserId } });
        const rows = permissions.filter((p) => validKeys.has(p.key));
        if (rows.length) {
            await tx.memberPermission.createMany({
                data: rows.map((p) => ({ tenantId, userId: targetUserId, key: p.key, allowed: !!p.allowed })),
            });
        }
    });
    const result = await prisma.memberPermission.findMany({ where: { tenantId, userId: targetUserId } });
    await logAction({ tenantId, userId: actorUserId, action: 'MEMBER_PERMISSIONS_UPDATED', entity: 'TENANT_MEMBER', entityId: targetUserId, meta: { permissions: result.map((p) => ({ key: p.key, allowed: p.allowed })) } });
    return result;
}
export async function getMemberPermissions(tenantId, actorUserId, targetUserId) {
    const actor = await prisma.tenantMember.findUnique({ where: { tenantId_userId: { tenantId, userId: actorUserId } } });
    if (!actor)
        throw new HttpError(403, 'Você não faz parte desta empresa');
    const target = await prisma.tenantMember.findUnique({ where: { tenantId_userId: { tenantId, userId: targetUserId } } });
    if (!target)
        throw new HttpError(404, 'Membro não encontrado');
    return prisma.memberPermission.findMany({ where: { tenantId, userId: targetUserId } });
}

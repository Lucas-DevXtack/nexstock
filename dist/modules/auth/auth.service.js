import bcrypt from 'bcryptjs';
import { prisma } from '../../shared/db/prisma.js';
import { HttpError } from '../../shared/http/errors.js';
import { hashPassword, verifyPassword } from './utils/password.js';
import { signAccessToken } from './jwt.js';
import { mintToken, storeRefreshToken } from './auth.tokens.js';
async function issueSession(userId) {
    const accessToken = signAccessToken(userId);
    const refreshRaw = mintToken(32);
    const refresh = await storeRefreshToken(userId, refreshRaw, 30);
    return { accessToken, refreshToken: refresh.token, refreshExpiresAt: refresh.expiresAt, token: accessToken };
}
export async function signup(name, email, password) {
    if (!name || !email || !password)
        throw new HttpError(400, 'Missing fields');
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists)
        throw new HttpError(409, 'Email already in use');
    const user = await prisma.user.create({
        data: { name, email, password: await hashPassword(password) },
        select: { id: true, name: true, email: true, avatarUrl: true },
    });
    return { user, ...(await issueSession(user.id)) };
}
export async function login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        throw new HttpError(401, 'Invalid credentials');
    const ok = await verifyPassword(password, user.password);
    if (!ok)
        throw new HttpError(401, 'Invalid credentials');
    return {
        user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
        ...(await issueSession(user.id)),
    };
}
export async function me(userId) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true },
    });
}
export async function updateMe(userId, input) {
    const data = {};
    if (typeof input.name === 'string') {
        const name = input.name.trim();
        if (name.length < 2)
            throw new HttpError(400, 'Nome inválido');
        data.name = name;
    }
    if (input.avatarUrl !== undefined) {
        if (input.avatarUrl === null || input.avatarUrl === '') {
            data.avatarUrl = null;
        }
        else {
            const avatarUrl = String(input.avatarUrl);
            if (!avatarUrl.startsWith('data:image/'))
                throw new HttpError(400, 'Formato de imagem inválido');
            if (avatarUrl.length > 2_500_000)
                throw new HttpError(400, 'Imagem muito grande');
            data.avatarUrl = avatarUrl;
        }
    }
    return prisma.user.update({
        where: { id: userId },
        data,
        select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true },
    });
}
export async function changePassword(userId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword)
        throw new HttpError(400, 'currentPassword and newPassword required');
    if (newPassword.length < 8)
        throw new HttpError(400, 'Password too short');
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new HttpError(404, 'User not found');
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok)
        throw new HttpError(400, 'Current password is incorrect');
    const password = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password } });
    return { ok: true };
}
export async function deleteAccount(userId, password) {
    if (!password)
        throw new HttpError(400, 'Password required');
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { memberships: true },
    });
    if (!user)
        throw new HttpError(404, 'User not found');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
        throw new HttpError(400, 'Current password is incorrect');
    const ownerMemberships = user.memberships.filter((membership) => membership.role === 'OWNER');
    for (const membership of ownerMemberships) {
        const ownersCount = await prisma.tenantMember.count({
            where: { tenantId: membership.tenantId, role: 'OWNER' },
        });
        if (ownersCount <= 1) {
            throw new HttpError(400, 'Você é o único proprietário de uma empresa. Transfira a propriedade ou exclua a empresa antes de deletar sua conta.');
        }
    }
    await prisma.$transaction([
        prisma.tenantInvite.deleteMany({ where: { OR: [{ invitedByUserId: userId }, { email: user.email }] } }),
        prisma.memberPermission.deleteMany({ where: { userId } }),
        prisma.tenantMember.deleteMany({ where: { userId } }),
        prisma.refreshToken.deleteMany({ where: { userId } }),
        prisma.passwordResetToken.deleteMany({ where: { userId } }),
        prisma.auditLog.updateMany({ where: { userId }, data: { userId: null } }),
        prisma.stockMove.updateMany({ where: { createdByUserId: userId }, data: { createdByUserId: null } }),
        prisma.user.delete({ where: { id: userId } }),
    ]);
    return { ok: true };
}

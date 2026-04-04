import crypto from 'crypto';
import { prisma } from '../../shared/db/prisma.js';
export function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}
export function mintToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex');
}
export async function storeRefreshToken(userId, rawToken, days = 30) {
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
    return { token: rawToken, expiresAt };
}
export async function rotateRefreshToken(oldRaw) {
    const oldHash = hashToken(oldRaw);
    const old = await prisma.refreshToken.findUnique({ where: { tokenHash: oldHash } });
    if (!old || old.revokedAt || old.expiresAt < new Date())
        return null;
    const newRaw = mintToken(32);
    const newHash = hashToken(newRaw);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { userId: old.userId, tokenHash: newHash, expiresAt } });
    await prisma.refreshToken.update({ where: { tokenHash: oldHash }, data: { revokedAt: new Date(), replacedByTokenHash: newHash } });
    return { userId: old.userId, token: newRaw, expiresAt };
}
export async function revokeRefreshToken(raw) {
    const h = hashToken(raw);
    await prisma.refreshToken.updateMany({ where: { tokenHash: h, revokedAt: null }, data: { revokedAt: new Date() } });
}
export async function createPasswordReset(email) {
    email = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        return null;
    const raw = mintToken(24);
    const tokenHash = hashToken(raw);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } });
    return { email: user.email, token: raw, expiresAt };
}
export async function consumePasswordReset(raw) {
    const tokenHash = hashToken(raw);
    const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!row || row.usedAt || row.expiresAt < new Date())
        return null;
    await prisma.passwordResetToken.update({ where: { tokenHash }, data: { usedAt: new Date() } });
    return row.userId;
}

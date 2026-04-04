import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { env } from '../../config/env.js';
import { prisma } from '../../shared/db/prisma.js';
import { sendMail } from '../../shared/mailer/mailer.js';
import { authLimiter } from '../../shared/security/rateLimit.js';
import { forgotPasswordSchema, loginSchema, refreshSchema, resetPasswordSchema } from '../../shared/validation/auth.schemas.js';
import { destroyAccount, getMe, patchMe, patchChangePassword, postLogin, postSignup } from './auth.controller.js';
import { requireAuth } from './guards/auth.guard.js';
import { consumePasswordReset, createPasswordReset, revokeRefreshToken, rotateRefreshToken } from './auth.tokens.js';
import { signAccessToken } from './jwt.js';
import { login } from './auth.service.js';
export const authRoutes = Router();
authRoutes.post('/signup', authLimiter, postSignup);
authRoutes.post('/login', authLimiter, postLogin);
authRoutes.get('/me', requireAuth, getMe);
authRoutes.patch('/me', requireAuth, patchMe);
authRoutes.patch('/change-password', requireAuth, patchChangePassword);
authRoutes.delete('/delete-account', requireAuth, destroyAccount);
// backward-compatible alias
authRoutes.post('/login2', authLimiter, async (req, res) => {
    const { email, password } = loginSchema.parse(req.body || {});
    const session = await login(email, password);
    res.json(session);
});
authRoutes.post('/refresh', authLimiter, async (req, res) => {
    const { refreshToken } = refreshSchema.parse(req.body || {});
    const rotated = await rotateRefreshToken(refreshToken);
    if (!rotated)
        return res.status(401).json({ error: 'Invalid refresh token' });
    const accessToken = signAccessToken(rotated.userId);
    res.json({ accessToken, refreshToken: rotated.token, refreshExpiresAt: rotated.expiresAt, token: accessToken });
});
authRoutes.post('/logout', requireAuth, async (req, res) => {
    const rt = String(req.body?.refreshToken || '');
    if (rt)
        await revokeRefreshToken(rt);
    res.json({ ok: true });
});
authRoutes.post('/forgot', authLimiter, async (req, res) => {
    const { email } = forgotPasswordSchema.parse(req.body || {});
    const reset = await createPasswordReset(email);
    if (reset) {
        const link = `${env.WEB_URL.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(reset.token)}`;
        await sendMail({
            to: reset.email,
            subject: 'Recuperação de senha NexStock',
            text: `Use o link para redefinir sua senha: ${link}`,
            html: `<p>Use o link para redefinir sua senha:</p><p><a href="${link}">${link}</a></p>`,
        });
    }
    res.json({ ok: true });
});
authRoutes.post('/reset', authLimiter, async (req, res) => {
    const { token, newPassword } = resetPasswordSchema.parse(req.body || {});
    const userId = await consumePasswordReset(token);
    if (!userId)
        return res.status(400).json({ error: 'Invalid or expired token' });
    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hash } });
    res.json({ ok: true });
});

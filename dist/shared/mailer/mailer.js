import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
export function smtpEnabled() {
    return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}
export function buildInviteLink(token) {
    return `${env.WEB_URL.replace(/\/$/, '')}/invite/accept?token=${encodeURIComponent(token)}`;
}
export async function sendMail(opts) {
    if (!smtpEnabled())
        return { skipped: true };
    const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
    await transporter.sendMail({
        from: env.SMTP_FROM,
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
        html: opts.html,
    });
    return { skipped: false };
}

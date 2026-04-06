import crypto from 'node:crypto';
import type { Request, Response } from 'express';
import { env } from '../../config/env.js';
import { prisma } from '../../shared/db/prisma.js';

function sha256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function inferDeviceType(ua = '') {
  const s = ua.toLowerCase();
  if (/mobile|iphone|android/.test(s)) return 'mobile';
  if (/ipad|tablet/.test(s)) return 'tablet';
  return 'desktop';
}

function inferOS(ua = '') {
  const s = ua.toLowerCase();
  if (s.includes('android')) return 'Android';
  if (s.includes('iphone') || s.includes('ipad') || s.includes('ios')) return 'iOS';
  if (s.includes('windows')) return 'Windows';
  if (s.includes('mac os') || s.includes('macintosh')) return 'macOS';
  if (s.includes('linux')) return 'Linux';
  return 'Unknown';
}

function inferBrowser(ua = '') {
  const s = ua.toLowerCase();
  if (s.includes('edg/')) return 'Edge';
  if (s.includes('chrome/')) return 'Chrome';
  if (s.includes('safari/') && !s.includes('chrome/')) return 'Safari';
  if (s.includes('firefox/')) return 'Firefox';
  return 'Unknown';
}

const WEB_URL = (env.WEB_PUBLIC_URL || env.WEB_URL || 'https://nexstock-web.vercel.app').replace(/\/$/, '');

function targetForSlug(slug: string) {
  if (slug === 'app') return `${WEB_URL}/login?utm_source=qr&utm_medium=offline&utm_campaign=nexstock_app`;
  if (slug === 'signup') return `${WEB_URL}/signup?utm_source=qr&utm_medium=offline&utm_campaign=nexstock_signup`;
  return `${WEB_URL}/?utm_source=qr&utm_medium=offline&utm_campaign=nexstock_main`;
}

function hasConsent(req: Request) {
  const queryConsent = String(req.query.consent || '').toLowerCase();
  const headerConsent = String(req.get('x-consent-analytics') || '').toLowerCase();
  return queryConsent === 'true' || headerConsent === 'true';
}

export async function qrRedirect(req: Request, res: Response) {
  const slug = String(req.params.slug || 'main');
  const targetUrl = targetForSlug(slug);
  const consent = hasConsent(req);

  if (!consent) {
    return res.redirect(302, targetUrl);
  }

  const userAgent = String(req.get('user-agent') || '');
  const referrer = String(req.get('referer') || '');
  const forwardedFor = String(req.headers['x-forwarded-for'] || '');
  const ip = forwardedFor.split(',')[0]?.trim() || req.ip || '';

  try {
    await prisma.qrScan.create({
      data: {
        slug,
        targetUrl,
        source: String(req.query.utm_source || 'qr'),
        medium: String(req.query.utm_medium || 'offline'),
        campaign: String(req.query.utm_campaign || `nexstock_${slug}`),
        referrer,
        ipHash: ip ? sha256(ip) : null,
        userAgent,
        deviceType: inferDeviceType(userAgent),
        os: inferOS(userAgent),
        browser: inferBrowser(userAgent),
        consent: true,
      },
    });
  } catch (error) {
    console.error('[qr] failed to track scan:', error);
  }

  return res.redirect(302, targetUrl);
}

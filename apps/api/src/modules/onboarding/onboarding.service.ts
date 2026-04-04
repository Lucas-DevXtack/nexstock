import { prisma } from '../../shared/db/prisma.js';
import { HttpError } from '../../shared/http/errors.js';

export async function submitOnboarding(tenantId: string, payload: any) {
  const businessType = String(payload.businessType||'').trim();
  const regime = String(payload.regime||'').trim();
  const usesStock = Boolean(payload.usesStock);
  const wantsFinance = Boolean(payload.wantsFinance);

  if (!businessType || !regime) throw new HttpError(400, 'businessType and regime required');

  const profile = await prisma.tenantProfile.upsert({
    where: { tenantId },
    update: {
      businessType, regime, usesStock, wantsFinance,
      avgTicket: payload.avgTicket ?? null,
      monthlyVolume: payload.monthlyVolume ?? null,
    },
    create: {
      tenantId, businessType, regime, usesStock, wantsFinance,
      avgTicket: payload.avgTicket ?? null,
      monthlyVolume: payload.monthlyVolume ?? null,
    },
  });

  return { profile, flags: { finance_enabled: wantsFinance } };
}

export async function getOnboardingStatus(tenantId: string) {
  const [profile, tenant, productsCount, stockLotsCount, salesCount] = await Promise.all([
    prisma.tenantProfile.findUnique({ where: { tenantId } }),
    prisma.tenant.findUnique({ where: { id: tenantId }, select: { plan: true } }),
    prisma.product.count({ where: { tenantId } }),
    prisma.stockLot.count({ where: { tenantId } }),
    prisma.stockMove.count({ where: { tenantId, type: 'OUT', reason: 'SALE' } as any }),
  ]);

  return {
    completed: Boolean(profile),
    profile,
    plan: (tenant?.plan || 'FREE'),
    checklist: {
      hasProducts: productsCount > 0,
      hasStock: stockLotsCount > 0,
      hasSale: salesCount > 0,
    },
  };
}

import { prisma } from '../../shared/db/prisma.js';
import { HttpError } from '../../shared/http/errors.js';

export async function listTransactions(tenantId: string) {
  return prisma.transaction.findMany({ where: { tenantId }, include: { category: true }, orderBy: { occurredAt: 'desc' } });
}

export async function createTransaction(tenantId: string, payload: any) {
  const type = String(payload.type||'').trim();
  const amount = Number(payload.amount);
  if ((type !== 'INCOME' && type !== 'EXPENSE') || !Number.isFinite(amount) || amount <= 0)
    throw new HttpError(400, 'type(INCOME|EXPENSE) and amount>0 required');

  return prisma.transaction.create({
    data: {
      tenantId, type: type as any, amount: payload.amount,
      description: payload.description ? String(payload.description) : null,
      occurredAt: payload.occurredAt ? new Date(payload.occurredAt) : new Date(),
    },
  });
}

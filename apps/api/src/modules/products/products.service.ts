import { prisma } from '../../shared/db/prisma.js';
import { HttpError } from '../../shared/http/errors.js';
import { assertProductCreationAllowed } from '../billing/billing.service.js';

type ProductPayload = {
  name?: string;
  sku?: string | null;
  unitId?: string;
  lowStockThreshold?: number | null;
  sellPrice?: number | null;
};

function normalizePayload(payload: any): ProductPayload {
  const name = payload.name != null ? String(payload.name).trim() : undefined;
  const unitId = payload.unitId != null ? String(payload.unitId).trim() : undefined;
  const sku = payload.sku === '' ? null : payload.sku != null ? String(payload.sku).trim() : undefined;
  const lowStockThreshold = payload.lowStockThreshold === '' || payload.lowStockThreshold == null
    ? payload.lowStock === '' || payload.lowStock == null
      ? undefined
      : Number(payload.lowStock)
    : Number(payload.lowStockThreshold);
  const sellPrice = payload.sellPrice === '' || payload.sellPrice == null ? undefined : Number(payload.sellPrice);

  return {
    name,
    unitId,
    sku,
    lowStockThreshold: lowStockThreshold === undefined ? undefined : lowStockThreshold,
    sellPrice: sellPrice === undefined ? undefined : sellPrice,
  };
}

async function assertUnitExists(unitId: string) {
  const unit = await prisma.unit.findUnique({ where: { id: unitId } });
  if (!unit) throw new HttpError(400, 'Invalid unitId');
}

export async function listProducts(tenantId: string, includeArchived = false) {
  return prisma.product.findMany({
    where: {
      tenantId,
      ...(includeArchived ? {} : { isActive: true }),
    },
    include: { unit: true, category: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createProduct(tenantId: string, payload: any) {
  const data = normalizePayload(payload);
  if (!data.name || !data.unitId) throw new HttpError(400, 'name and unitId required');
  if (data.lowStockThreshold != null && (!Number.isFinite(data.lowStockThreshold) || data.lowStockThreshold < 0)) {
    throw new HttpError(400, 'lowStockThreshold must be >= 0');
  }
  if (data.sellPrice != null && (!Number.isFinite(data.sellPrice) || data.sellPrice < 0)) {
    throw new HttpError(400, 'sellPrice must be >= 0');
  }

  await assertUnitExists(data.unitId);
  await assertProductCreationAllowed(tenantId);

  return prisma.product.create({
    data: {
      tenantId,
      name: data.name,
      sku: data.sku ?? null,
      unitId: data.unitId,
      lowStockThreshold: data.lowStockThreshold ?? null,
      sellPrice: data.sellPrice ?? null,
    },
    include: { unit: true, category: true },
  });
}

export async function updateProduct(tenantId: string, productId: string, payload: any) {
  const existing = await prisma.product.findFirst({ where: { id: productId, tenantId } });
  if (!existing) throw new HttpError(404, 'Product not found');

  const data = normalizePayload(payload);
  if (data.name !== undefined && !data.name) throw new HttpError(400, 'name cannot be empty');
  if (data.lowStockThreshold != null && (!Number.isFinite(data.lowStockThreshold) || data.lowStockThreshold < 0)) {
    throw new HttpError(400, 'lowStockThreshold must be >= 0');
  }
  if (data.sellPrice != null && (!Number.isFinite(data.sellPrice) || data.sellPrice < 0)) {
    throw new HttpError(400, 'sellPrice must be >= 0');
  }
  if (data.unitId) await assertUnitExists(data.unitId);

  return prisma.product.update({
    where: { id: productId },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.sku !== undefined ? { sku: data.sku } : {}),
      ...(data.unitId !== undefined ? { unitId: data.unitId } : {}),
      ...(data.lowStockThreshold !== undefined ? { lowStockThreshold: data.lowStockThreshold } : {}),
      ...(data.sellPrice !== undefined ? { sellPrice: data.sellPrice } : {}),
    },
    include: { unit: true, category: true },
  });
}

export async function archiveProduct(tenantId: string, productId: string) {
  const existing = await prisma.product.findFirst({ where: { id: productId, tenantId } });
  if (!existing) throw new HttpError(404, 'Product not found');

  return prisma.product.update({
    where: { id: productId },
    data: { isActive: false, archivedAt: new Date() },
    include: { unit: true, category: true },
  });
}

export async function unarchiveProduct(tenantId: string, productId: string) {
  const existing = await prisma.product.findFirst({ where: { id: productId, tenantId } });
  if (!existing) throw new HttpError(404, 'Product not found');

  return prisma.product.update({
    where: { id: productId },
    data: { isActive: true, archivedAt: null },
    include: { unit: true, category: true },
  });
}

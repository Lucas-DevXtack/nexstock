import { ok } from '../../shared/http/response.js';
import { prisma } from '../../shared/db/prisma.js';
export async function getDashboard(req, res) {
    const tenantId = req.tenantId;
    const [products, moves, transactions, recentProducts, recentMoves] = await Promise.all([
        prisma.product.count({ where: { tenantId, isActive: true } }),
        prisma.stockMove.count({ where: { tenantId } }),
        prisma.transaction.count({ where: { tenantId } }),
        prisma.product.findMany({
            where: { tenantId, isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: { id: true, name: true, sku: true },
        }),
        prisma.stockMove.findMany({
            where: { tenantId },
            orderBy: { occurredAt: 'desc' },
            take: 5,
            select: {
                id: true,
                type: true,
                occurredAt: true,
                product: { select: { name: true } },
            },
        }),
    ]);
    return ok(res, {
        plan: req.plan || 'FREE',
        flags: req.flags || {},
        kpis: { products, moves, transactions },
        recentProducts,
        recentMoves: recentMoves.map((item) => ({
            id: item.id,
            type: item.type,
            occurredAt: item.occurredAt,
            productName: item.product?.name || null,
        })),
    });
}

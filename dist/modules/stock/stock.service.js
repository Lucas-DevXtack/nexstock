import { prisma } from '../../shared/db/prisma.js';
import { HttpError } from '../../shared/http/errors.js';
import { computeNewAvgCost } from './calculators/avg-cost.calculator.js';
export async function moveStock(tenantId, payload) {
    const productId = String(payload.productId || '').trim();
    const type = String(payload.type || '').trim();
    const quantity = Number(payload.quantity);
    const unitCost = payload.unitCost != null ? Number(payload.unitCost) : undefined;
    if (!productId || (type !== 'IN' && type !== 'OUT') || !Number.isFinite(quantity) || quantity <= 0)
        throw new HttpError(400, 'productId, type(IN|OUT), quantity>0 required');
    if (type === 'IN' && (!Number.isFinite(unitCost) || unitCost < 0))
        throw new HttpError(400, 'unitCost required for IN');
    const product = await prisma.product.findFirst({ where: { id: productId, tenantId } });
    if (!product)
        throw new HttpError(404, 'Product not found');
    if (!product.isActive)
        throw new HttpError(400, 'Archived product cannot receive stock moves');
    const moves = await prisma.stockMove.findMany({ where: { tenantId, productId } });
    let currentQty = 0;
    for (const m of moves)
        currentQty += (m.type === 'IN' ? Number(m.quantity) : -Number(m.quantity));
    let currentAvg = product.costAvg != null ? Number(product.costAvg) : 0;
    let newAvg = currentAvg;
    if (type === 'IN')
        newAvg = computeNewAvgCost(currentQty, currentAvg, quantity, unitCost);
    const move = await prisma.stockMove.create({
        data: { tenantId, productId, type: type, quantity: payload.quantity, unitCost: type === 'IN' ? payload.unitCost : null },
    });
    if (type === 'IN')
        await prisma.product.update({ where: { id: productId }, data: { costAvg: newAvg } });
    return { move, costAvg: newAvg };
}
export async function getBalance(tenantId) {
    const products = await prisma.product.findMany({ where: { tenantId, isActive: true }, include: { unit: true } });
    const out = [];
    for (const p of products) {
        const moves = await prisma.stockMove.findMany({ where: { tenantId, productId: p.id } });
        let qty = 0;
        for (const m of moves)
            qty += (m.type === 'IN' ? Number(m.quantity) : -Number(m.quantity));
        out.push({
            productId: p.id,
            name: p.name,
            unit: p.unit.code,
            quantity: qty,
            lowStockThreshold: p.lowStockThreshold,
            costAvg: p.costAvg,
            immobilizedValue: p.costAvg != null ? qty * Number(p.costAvg) : null,
        });
    }
    return out;
}

import { prisma } from '../db/prisma.js';
import { fail } from '../http/response.js';
export async function requireActiveTenant(req, res, next) {
    const tenantId = req.tenantId;
    if (!tenantId)
        return fail(res, 400, 'Tenant not selected');
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { status: true },
    });
    if (!tenant)
        return fail(res, 404, 'Empresa não encontrada');
    if (tenant.status === 'CLOSED')
        return fail(res, 403, 'Empresa encerrada. Reative ou selecione outra empresa.');
    if (tenant.status === 'ARCHIVED')
        return fail(res, 403, 'Empresa arquivada. Reative para voltar a operar.');
    next();
}

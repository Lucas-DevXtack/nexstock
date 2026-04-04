import { prisma } from '../../../shared/db/prisma.js';
import { fail } from '../../../shared/http/response.js';
const rank = { OWNER: 2, MANAGER: 1, STAFF: 0 };
export function requireRole(minRole) {
    return async (req, res, next) => {
        const tenantId = req.tenantId;
        const userId = req.userId;
        const m = await prisma.tenantMember.findUnique({ where: { tenantId_userId: { tenantId, userId } } });
        if (!m)
            return fail(res, 403, 'Not a tenant member');
        if (rank[m.role] < rank[minRole])
            return fail(res, 403, `Requires role ${minRole}`);
        // expose role
        req.memberRole = m.role;
        next();
    };
}

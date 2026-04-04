import { fail } from '../../../shared/http/response.js';
const rank = { FREE: 0, PRO: 1, BUSINESS: 2 };
const paidStatuses = new Set(['active', 'trialing', 'ACTIVE', 'TRIALING']);
export function requirePlan(minPlan) {
    return (req, res, next) => {
        const plan = (req.plan || 'FREE');
        if (rank[plan] < rank[minPlan])
            return fail(res, 403, `Requires plan ${minPlan}`);
        if (minPlan !== 'FREE' && !paidStatuses.has(String(req.billingStatus || ''))) {
            return fail(res, 403, 'Pagamento pendente ou assinatura inativa para este recurso');
        }
        next();
    };
}

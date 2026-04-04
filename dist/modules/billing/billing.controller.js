import { ok, fail } from '../../shared/http/response.js';
import { prisma } from '../../shared/db/prisma.js';
import { cancelBilling, createCheckoutSession, createPortalSession, getBillingStatus, reconcileBillingStatus, startProTrial } from './billing.service.js';
export async function getStatus(req, res) {
    try {
        return ok(res, await getBillingStatus(req.tenantId));
    }
    catch (e) {
        console.error('[billing.getStatus]', { status: e?.status, message: e?.message, details: e?.details });
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
}
export async function postCheckout(req, res) {
    try {
        const plan = String(req.body?.plan || 'PRO');
        if (!['PRO', 'BUSINESS'].includes(plan))
            return fail(res, 400, 'Invalid plan');
        const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { email: true } });
        if (!user?.email)
            return fail(res, 401, 'User not found');
        const out = await createCheckoutSession({ tenantId: req.tenantId, userEmail: user.email, plan });
        return ok(res, out, 201);
    }
    catch (e) {
        console.error('[billing.postCheckout]', { status: e?.status, message: e?.message, details: e?.details });
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
}
export async function postPortal(req, res) {
    try {
        const out = await createPortalSession({ tenantId: req.tenantId, returnUrl: req.body?.returnUrl });
        return ok(res, out, 201);
    }
    catch (e) {
        console.error('[billing.postPortal]', { status: e?.status, message: e?.message, details: e?.details });
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
}
export async function postStartTrial(req, res) {
    try {
        return ok(res, await startProTrial({ tenantId: req.tenantId }), 201);
    }
    catch (e) {
        console.error('[billing.postStartTrial]', { status: e?.status, message: e?.message, details: e?.details });
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
}
export async function postCancel(req, res) {
    try {
        return ok(res, await cancelBilling(req.tenantId));
    }
    catch (e) {
        console.error('[billing.postCancel]', { status: e?.status, message: e?.message, details: e?.details });
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
}
export async function postReconcile(req, res) {
    try {
        return ok(res, await reconcileBillingStatus(req.tenantId));
    }
    catch (e) {
        console.error('[billing.postReconcile]', { status: e?.status, message: e?.message, details: e?.details });
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
}

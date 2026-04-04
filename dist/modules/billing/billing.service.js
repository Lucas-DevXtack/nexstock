import { prisma } from '../../shared/db/prisma.js';
import { env } from '../../config/env.js';
import { amountForPlan, createPreference, getMerchantOrder, getPayment, searchPaymentsByExternalReference } from '../../shared/billing/mercadopago.js';
import { HttpError } from '../../shared/http/errors.js';
const PAID_STATUSES = new Set(['ACTIVE', 'TRIALING']);
const PLAN_RANK = { FREE: 0, PRO: 1, BUSINESS: 2 };
const PRO_TRIAL_DAYS = 7;
export function isPaidPlanUsable(status) {
    return !!status && PAID_STATUSES.has(String(status).toUpperCase());
}
export function getEffectivePlan(plan, billingStatus, billingCurrentPeriodEnd) {
    if (plan === 'FREE')
        return 'FREE';
    if (!isPaidPlanUsable(billingStatus))
        return 'FREE';
    if (billingCurrentPeriodEnd && billingCurrentPeriodEnd.getTime() < Date.now())
        return 'FREE';
    return plan;
}
export async function expireTenantIfNeeded(tenantId) {
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
            id: true,
            plan: true,
            billingStatus: true,
            billingCurrentPeriodEnd: true,
            billingTrialEndsAt: true,
        },
    });
    if (!tenant)
        throw new HttpError(404, 'Tenant not found');
    const expiry = tenant.billingTrialEndsAt || tenant.billingCurrentPeriodEnd;
    if (!expiry)
        return tenant;
    if (!['ACTIVE', 'TRIALING', 'PENDING'].includes(String(tenant.billingStatus)))
        return tenant;
    if (expiry.getTime() >= Date.now())
        return tenant;
    return prisma.tenant.update({
        where: { id: tenantId },
        data: {
            plan: 'FREE',
            billingStatus: 'EXPIRED',
            billingCurrentPeriodEnd: null,
            billingCheckoutUrl: null,
        },
        select: {
            id: true,
            plan: true,
            billingStatus: true,
            billingCurrentPeriodEnd: true,
            billingTrialEndsAt: true,
        },
    });
}
function isPublicHttpUrl(url) {
    const normalized = String(url || '').trim();
    return /^https?:\/\//i.test(normalized) && !/localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\./i.test(normalized);
}
function getReturnWebUrl() {
    const publicWeb = String(env.WEB_PUBLIC_URL || '').replace(/\/$/, '');
    const localWeb = String(env.WEB_URL || '').replace(/\/$/, '');
    return {
        publicWeb: isPublicHttpUrl(publicWeb) ? publicWeb : null,
        localWeb: localWeb || 'http://localhost:5173',
    };
}
function toPublicApiUrl() {
    const fromEnv = env.API_PUBLIC_URL || env.WEBHOOK_BASE_URL;
    if (!fromEnv)
        return null;
    const normalized = fromEnv.replace(/\/$/, '');
    if (/localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(normalized))
        return null;
    return normalized;
}
export async function getBillingStatus(tenantId) {
    await expireTenantIfNeeded(tenantId);
    const t = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: {
            subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
            payments: { orderBy: { createdAt: 'desc' }, take: 5 },
        },
    });
    if (!t)
        throw new HttpError(404, 'Tenant not found');
    const effectivePlan = getEffectivePlan(t.plan, t.billingStatus, t.billingCurrentPeriodEnd);
    return {
        provider: t.billingProvider,
        plan: t.plan,
        effectivePlan,
        billingStatus: t.billingStatus,
        billingCurrentPeriodEnd: t.billingCurrentPeriodEnd,
        billingTrialEndsAt: t.billingTrialEndsAt,
        billingCheckoutUrl: t.billingCheckoutUrl,
        billingCustomerId: t.billingCustomerId,
        billingSubscriptionId: t.billingSubscriptionId,
        requiresPaymentAction: Boolean(t.plan !== 'FREE' && !isPaidPlanUsable(t.billingStatus)),
        canStartTrial: t.plan === 'FREE' && !t.billingTrialUsedAt,
        latestSubscription: t.subscriptions[0] || null,
        recentPayments: t.payments,
        features: {
            stock: true,
            finance: PLAN_RANK[effectivePlan] >= PLAN_RANK.PRO,
            reports: PLAN_RANK[effectivePlan] >= PLAN_RANK.PRO,
            team: PLAN_RANK[effectivePlan] >= PLAN_RANK.BUSINESS,
        },
    };
}
export async function startProTrial(opts) {
    const tenant = await prisma.tenant.findUnique({ where: { id: opts.tenantId } });
    if (!tenant)
        throw new HttpError(404, 'Tenant not found');
    if (tenant.billingTrialUsedAt)
        throw new HttpError(409, 'Este tenant já usou o teste grátis do PRO');
    if (tenant.plan !== 'FREE')
        throw new HttpError(409, 'O teste grátis só pode começar a partir do plano FREE');
    const now = new Date();
    const endsAt = new Date(now.getTime() + PRO_TRIAL_DAYS * 24 * 60 * 60 * 1000);
    await prisma.tenant.update({
        where: { id: opts.tenantId },
        data: {
            plan: 'PRO',
            billingProvider: 'MERCADO_PAGO',
            billingStatus: 'TRIALING',
            billingInterval: 'MONTH',
            billingTrialUsedAt: now,
            billingTrialEndsAt: endsAt,
            billingCurrentPeriodEnd: endsAt,
            stripeStatus: 'trialing',
            stripeCurrentPeriodEnd: endsAt,
        },
    });
    return getBillingStatus(opts.tenantId);
}
export async function createCheckoutSession(opts) {
    const tenant = await prisma.tenant.findUnique({ where: { id: opts.tenantId } });
    if (!tenant)
        throw new HttpError(404, 'Tenant not found');
    await expireTenantIfNeeded(opts.tenantId);
    const amount = amountForPlan(opts.plan);
    const publicApiUrl = toPublicApiUrl();
    const { publicWeb, localWeb } = getReturnWebUrl();
    const notificationUrl = publicApiUrl ? `${publicApiUrl}/billing/webhook` : '';
    const backUrlBase = publicWeb || localWeb;
    if (!publicApiUrl) {
        console.warn('[billing.createCheckoutSession] API_PUBLIC_URL não é pública; notification_url será omitida. Use ngrok/domínio público para webhooks automáticos.');
    }
    if (!publicWeb) {
        console.warn('[billing.createCheckoutSession] WEB_PUBLIC_URL não é pública; auto_return pode não redirecionar automaticamente após pagamento.');
    }
    const pref = await createPreference({
        tenantId: opts.tenantId,
        userEmail: opts.userEmail,
        plan: opts.plan,
        amount,
        title: `NexStock ${opts.plan}`,
        notificationUrl,
        successUrl: `${backUrlBase}/app/billing?success=1`,
        pendingUrl: `${backUrlBase}/app/billing?pending=1`,
        failureUrl: `${backUrlBase}/app/billing?failure=1`,
    });
    const checkoutUrl = env.MP_USE_SANDBOX
        ? (pref.sandbox_init_point || pref.init_point)
        : (pref.init_point || pref.sandbox_init_point);
    console.info('[billing.createCheckoutSession.preference]', {
        preferenceId: pref.id,
        init_point: pref.init_point || null,
        sandbox_init_point: pref.sandbox_init_point || null,
        selectedCheckoutUrl: checkoutUrl || null,
        useSandbox: env.MP_USE_SANDBOX,
    });
    if (!checkoutUrl)
        throw new HttpError(500, 'Mercado Pago não retornou URL de checkout');
    const now = new Date();
    const expiresAt = pref.date_of_expiration ? new Date(pref.date_of_expiration) : new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const subscription = await prisma.billingSubscription.create({
        data: {
            tenantId: opts.tenantId,
            provider: 'MERCADO_PAGO',
            providerCheckoutId: pref.id,
            providerPlanCode: opts.plan,
            interval: 'MONTH',
            status: 'PENDING',
            amount,
            currency: 'BRL',
            checkoutUrl,
            checkoutExpiresAt: expiresAt,
            metadata: {
                externalReference: `tenant:${opts.tenantId}:plan:${opts.plan}`,
                source: 'checkout.preference',
            },
        },
    });
    await prisma.tenant.update({
        where: { id: opts.tenantId },
        data: {
            billingProvider: 'MERCADO_PAGO',
            billingStatus: 'PENDING',
            billingInterval: 'MONTH',
            billingCheckoutUrl: checkoutUrl,
            billingExternalRef: `tenant:${opts.tenantId}:plan:${opts.plan}`,
            billingLastEventAt: now,
            stripeStatus: 'pending',
        },
    });
    return { url: checkoutUrl, provider: 'MERCADO_PAGO', subscriptionId: subscription.id };
}
export async function createPortalSession(_opts) {
    throw new HttpError(400, 'Mercado Pago não possui portal de assinatura implementado neste projeto. Gere um novo link de pagamento ou use cancelamento interno.');
}
function mpPaymentStatusToInternal(status) {
    switch (String(status || '').toLowerCase()) {
        case 'approved': return 'APPROVED';
        case 'cancelled': return 'CANCELED';
        case 'rejected': return 'REJECTED';
        case 'refunded': return 'REFUNDED';
        case 'charged_back': return 'CHARGED_BACK';
        case 'expired': return 'EXPIRED';
        default: return 'PENDING';
    }
}
function mpPaymentStatusToBilling(status) {
    switch (String(status || '').toLowerCase()) {
        case 'approved': return 'ACTIVE';
        case 'cancelled': return 'CANCELED';
        case 'rejected': return 'PAST_DUE';
        case 'refunded': return 'PAST_DUE';
        case 'charged_back': return 'PAST_DUE';
        case 'expired': return 'EXPIRED';
        default: return 'PENDING';
    }
}
function parsePlanFromExternalReference(externalReference) {
    if (!externalReference)
        return null;
    const m = /plan:(PRO|BUSINESS)/i.exec(externalReference);
    return m?.[1]?.toUpperCase() || null;
}
function parseTenantIdFromExternalReference(externalReference) {
    if (!externalReference)
        return null;
    const m = /tenant:([^:]+)/i.exec(externalReference);
    return m?.[1] || null;
}
function sortPaymentsByDateDesc(payments = []) {
    return [...payments].sort((a, b) => {
        const da = new Date(a.date_approved || a.date_created || 0).getTime();
        const db = new Date(b.date_approved || b.date_created || 0).getTime();
        return db - da;
    });
}
function getMostRelevantMerchantOrderPayment(order) {
    const payments = sortPaymentsByDateDesc(order?.payments || []);
    return payments.find((p) => String(p.status || '').toLowerCase() === 'approved')
        || payments.find((p) => ['pending', 'in_process', 'authorized'].includes(String(p.status || '').toLowerCase()))
        || payments[0]
        || null;
}
export async function syncPaymentById(paymentId, webhookPayload) {
    let payment;
    try {
        payment = await getPayment(paymentId);
    }
    catch (err) {
        if (Number(err?.status || 0) === 404) {
            throw new HttpError(404, 'Payment not found');
        }
        throw err;
    }
    console.info('[billing.syncPaymentById]', {
        paymentId: String(payment?.id || paymentId),
        status: payment?.status,
        status_detail: payment?.status_detail,
        external_reference: payment?.external_reference || payment?.metadata?.external_reference || null,
    });
    const externalReference = payment.external_reference || payment.metadata?.external_reference || null;
    const tenantId = payment.metadata?.tenantId || parseTenantIdFromExternalReference(externalReference);
    const plan = (payment.metadata?.plan || parsePlanFromExternalReference(externalReference));
    if (!tenantId || !plan)
        throw new HttpError(400, 'Webhook do Mercado Pago sem tenantId/plan válidos');
    const subscription = await prisma.billingSubscription.findFirst({
        where: {
            tenantId,
            OR: [
                { providerCheckoutId: String(payment.order?.id || '') },
                { checkoutUrl: { not: null } },
            ],
        },
        orderBy: { createdAt: 'desc' },
    });
    const paymentStatus = mpPaymentStatusToInternal(payment.status);
    const billingStatus = mpPaymentStatusToBilling(payment.status);
    const approvedAt = payment.date_approved ? new Date(payment.date_approved) : null;
    const periodStart = approvedAt || new Date();
    const periodEnd = new Date(periodStart.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upsertedPayment = await prisma.billingPayment.upsert({
        where: { providerPaymentId: String(payment.id) },
        create: {
            tenantId,
            subscriptionId: subscription?.id,
            provider: 'MERCADO_PAGO',
            providerPaymentId: String(payment.id),
            providerOrderId: payment.order?.id ? String(payment.order.id) : null,
            status: paymentStatus,
            amount: Number(payment.transaction_amount || amountForPlan(plan)),
            currency: payment.currency_id || 'BRL',
            paymentMethod: payment.payment_method_id || payment.payment_type_id || null,
            approvedAt,
            rejectedAt: paymentStatus === 'REJECTED' ? new Date() : null,
            expiresAt: payment.date_of_expiration ? new Date(payment.date_of_expiration) : null,
            rawPayload: payment,
        },
        update: {
            subscriptionId: subscription?.id,
            providerOrderId: payment.order?.id ? String(payment.order.id) : null,
            status: paymentStatus,
            amount: Number(payment.transaction_amount || amountForPlan(plan)),
            currency: payment.currency_id || 'BRL',
            paymentMethod: payment.payment_method_id || payment.payment_type_id || null,
            approvedAt,
            rejectedAt: paymentStatus === 'REJECTED' ? new Date() : null,
            expiresAt: payment.date_of_expiration ? new Date(payment.date_of_expiration) : null,
            rawPayload: payment,
        },
    });
    let subId = subscription?.id;
    if (subscription) {
        const updated = await prisma.billingSubscription.update({
            where: { id: subscription.id },
            data: {
                providerCustomerId: payment.payer?.id ? String(payment.payer.id) : subscription.providerCustomerId,
                providerSubscriptionId: payment.order?.id ? String(payment.order.id) : subscription.providerSubscriptionId,
                status: billingStatus,
                approvedAt,
                currentPeriodStart: billingStatus === 'ACTIVE' ? periodStart : subscription.currentPeriodStart,
                currentPeriodEnd: billingStatus === 'ACTIVE' ? periodEnd : subscription.currentPeriodEnd,
                metadata: {
                    ...(typeof subscription.metadata === 'object' && subscription.metadata ? subscription.metadata : {}),
                    lastWebhookPayload: webhookPayload || null,
                    mercadoPagoStatus: payment.status,
                },
            },
        });
        subId = updated.id;
    }
    await prisma.tenant.update({
        where: { id: tenantId },
        data: {
            ...(billingStatus === 'ACTIVE' ? { plan } : {}),
            billingProvider: 'MERCADO_PAGO',
            billingCustomerId: payment.payer?.id ? String(payment.payer.id) : undefined,
            billingSubscriptionId: payment.order?.id ? String(payment.order.id) : undefined,
            billingStatus,
            billingInterval: 'MONTH',
            billingCheckoutUrl: billingStatus === 'ACTIVE' ? null : undefined,
            billingCurrentPeriodEnd: billingStatus === 'ACTIVE' ? periodEnd : undefined,
            billingTrialEndsAt: billingStatus === 'ACTIVE' ? null : undefined,
            billingLastEventAt: new Date(),
            stripeStatus: String(payment.status || '').toLowerCase() || 'pending',
            stripeCurrentPeriodEnd: billingStatus === 'ACTIVE' ? periodEnd : undefined,
        },
    });
    if (webhookPayload) {
        const providerEventId = String(webhookPayload.id || payment.id);
        const eventType = String(webhookPayload.type || webhookPayload.topic || 'payment');
        await prisma.billingWebhookEvent.upsert({
            where: { provider_eventType_providerEventId: { provider: 'MERCADO_PAGO', eventType, providerEventId } },
            create: {
                tenantId,
                provider: 'MERCADO_PAGO',
                eventType,
                providerEventId,
                resourceId: String(payment.id),
                processed: true,
                payload: webhookPayload,
                processedAt: new Date(),
            },
            update: {
                tenantId,
                resourceId: String(payment.id),
                processed: true,
                payload: webhookPayload,
                processedAt: new Date(),
                error: null,
            },
        });
    }
    return { tenantId, plan, payment: upsertedPayment, subscriptionId: subId, billingStatus, state: String(payment.status || '').toLowerCase() || 'pending' };
}
export async function syncMerchantOrderById(orderId, webhookPayload) {
    const order = await getMerchantOrder(orderId);
    const relevantPayment = getMostRelevantMerchantOrderPayment(order);
    console.info('[billing.syncMerchantOrderById]', {
        orderId: String(order?.id || orderId),
        orderStatus: order?.order_status || null,
        paymentCount: Array.isArray(order?.payments) ? order.payments.length : 0,
        relevantPaymentId: relevantPayment?.id ? String(relevantPayment.id) : null,
        relevantPaymentStatus: relevantPayment?.status || null,
    });
    if (!relevantPayment?.id) {
        throw new HttpError(400, 'Merchant order sem pagamento aprovado');
    }
    return syncPaymentById(String(relevantPayment.id), webhookPayload || order);
}
export async function reconcileBillingStatus(tenantId) {
    await expireTenantIfNeeded(tenantId);
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
            id: true,
            plan: true,
            billingStatus: true,
            billingExternalRef: true,
            billingCurrentPeriodEnd: true,
        },
    });
    if (!tenant)
        throw new HttpError(404, 'Tenant not found');
    const externalReference = tenant.billingExternalRef || null;
    if (!externalReference) {
        return { refreshed: false, reason: 'missing_external_reference', status: await getBillingStatus(tenantId) };
    }
    let search = null;
    try {
        search = await searchPaymentsByExternalReference(externalReference);
    }
    catch (err) {
        console.warn('[billing.reconcileBillingStatus.search]', {
            tenantId,
            externalReference,
            status: err?.status,
            message: err?.message,
        });
        return { refreshed: false, reason: 'search_failed', status: await getBillingStatus(tenantId) };
    }
    const results = Array.isArray(search?.results) ? search.results : [];
    const relevant = results.find((p) => String(p?.status || '').toLowerCase() === 'approved')
        || results.find((p) => ['pending', 'in_process', 'authorized'].includes(String(p?.status || '').toLowerCase()))
        || results[0]
        || null;
    console.info('[billing.reconcileBillingStatus]', {
        tenantId,
        externalReference,
        resultCount: results.length,
        relevantPaymentId: relevant?.id ? String(relevant.id) : null,
        relevantStatus: relevant?.status || null,
    });
    if (relevant?.id) {
        try {
            await syncPaymentById(String(relevant.id), {
                type: 'manual_reconcile',
                id: `manual:${tenantId}:${Date.now()}`,
                data: { id: String(relevant.id) },
            });
        }
        catch (err) {
            console.warn('[billing.reconcileBillingStatus.sync]', {
                tenantId,
                paymentId: String(relevant.id),
                status: err?.status,
                message: err?.message,
            });
        }
    }
    return {
        refreshed: Boolean(relevant?.id),
        paymentId: relevant?.id ? String(relevant.id) : null,
        paymentStatus: relevant?.status || null,
        status: await getBillingStatus(tenantId),
    };
}
export async function cancelBilling(tenantId) {
    await prisma.tenant.update({
        where: { id: tenantId },
        data: {
            plan: 'FREE',
            billingStatus: 'CANCELED',
            billingCurrentPeriodEnd: null,
            billingCheckoutUrl: null,
            stripeStatus: 'canceled',
            stripeCurrentPeriodEnd: null,
        },
    });
    return getBillingStatus(tenantId);
}
export async function assertProductCreationAllowed(tenantId) {
    await expireTenantIfNeeded(tenantId);
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { plan: true, billingStatus: true, billingCurrentPeriodEnd: true },
    });
    if (!tenant)
        throw new HttpError(404, 'Tenant not found');
    const effectivePlan = getEffectivePlan(tenant.plan, tenant.billingStatus, tenant.billingCurrentPeriodEnd);
    const count = await prisma.product.count({ where: { tenantId, isActive: true } });
    if (effectivePlan === 'FREE' && count >= 20) {
        throw new HttpError(403, 'Limite do plano FREE atingido: até 20 produtos ativos.');
    }
    if (effectivePlan === 'PRO' && count >= 500) {
        throw new HttpError(403, 'Limite do plano PRO atingido: até 500 produtos ativos.');
    }
}

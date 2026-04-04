import crypto from 'node:crypto';
import { env } from '../../config/env.js';
import { HttpError } from '../http/errors.js';
const API_BASE = 'https://api.mercadopago.com';
async function mpFetch(path, init = {}) {
    if (!env.MP_ACCESS_TOKEN)
        throw new HttpError(500, 'Mercado Pago não configurado');
    const headers = new Headers(init.headers || {});
    headers.set('Authorization', `Bearer ${env.MP_ACCESS_TOKEN}`);
    headers.set('Content-Type', 'application/json');
    headers.set('X-Idempotency-Key', headers.get('X-Idempotency-Key') || crypto.randomUUID());
    const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
    const text = await res.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    }
    catch {
        data = text || null;
    }
    if (!res.ok && init.expectOk !== false) {
        console.error('[mercadopago.http]', {
            path,
            status: res.status,
            data,
        });
        throw new HttpError(res.status, data?.message || data?.error || 'Falha no Mercado Pago', data);
    }
    return data;
}
export function ensureMercadoPago() {
    if (!env.MP_ACCESS_TOKEN)
        throw new HttpError(500, 'Mercado Pago não configurado');
    return true;
}
function isPublicUrl(url) {
    return (/^https?:\/\//i.test(url) &&
        !/localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\./i.test(url));
}
function sanitizeUrl(url) {
    const v = String(url || '').trim();
    return isPublicUrl(v) ? v : undefined;
}
function sanitizeBackUrl(url) {
    const v = String(url || '').trim();
    return /^https?:\/\//i.test(v) ? v : undefined;
}
export const PLAN_AMOUNTS = {
    PRO: 29.99,
    BUSINESS: 79.99,
};
export function amountForPlan(plan) {
    return PLAN_AMOUNTS[plan];
}
export async function createPreference(input) {
    const amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new HttpError(400, 'unit_price inválido');
    }
    if (!input.title || !input.title.trim()) {
        throw new HttpError(400, 'title inválido');
    }
    if (!input.userEmail || !/@/.test(input.userEmail)) {
        throw new HttpError(400, 'payer.email inválido');
    }
    const success = sanitizeBackUrl(input.successUrl);
    const pending = sanitizeBackUrl(input.pendingUrl);
    const failure = sanitizeBackUrl(input.failureUrl);
    const backUrls = {};
    if (success)
        backUrls.success = success;
    if (pending)
        backUrls.pending = pending;
    if (failure)
        backUrls.failure = failure;
    const payload = {
        external_reference: `tenant:${input.tenantId}:plan:${input.plan}`,
        items: [
            {
                id: `plan-${input.plan.toLowerCase()}`,
                title: input.title.trim(),
                quantity: 1,
                currency_id: 'BRL',
                unit_price: amount,
                description: `Assinatura ${input.plan} do NexStock`,
            },
        ],
        payer: {
            email: input.userEmail,
        },
        metadata: {
            tenantId: input.tenantId,
            plan: input.plan,
        },
        statement_descriptor: 'NEXSTOCK',
    };
    if (Object.keys(backUrls).length > 0) {
        payload.back_urls = backUrls;
    }
    const isPublicSuccess = !!success &&
        /^https?:\/\//i.test(success) &&
        !/localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\./i.test(success);
    if (isPublicSuccess) {
        payload.auto_return = 'approved';
    }
    const notificationUrl = sanitizeUrl(input.notificationUrl);
    if (notificationUrl) {
        payload.notification_url = notificationUrl;
    }
    console.info('[mercadopago.createPreference.payload]', payload);
    return mpFetch('/checkout/preferences', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}
export async function searchPaymentsByExternalReference(externalReference) {
    const ref = String(externalReference || '').trim();
    if (!ref)
        throw new HttpError(400, 'external_reference inválido');
    const path = `/v1/payments/search?sort=date_created&criteria=desc&limit=10&external_reference=${encodeURIComponent(ref)}`;
    return mpFetch(path, {
        method: 'GET',
    });
}
export async function getPayment(paymentId) {
    return mpFetch(`/v1/payments/${paymentId}`, {
        method: 'GET',
    });
}
export async function getMerchantOrder(orderId) {
    return mpFetch(`/merchant_orders/${orderId}`, {
        method: 'GET',
    });
}

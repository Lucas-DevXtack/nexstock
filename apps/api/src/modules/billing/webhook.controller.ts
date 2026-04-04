import { Request, Response } from 'express';
import { prisma } from '../../shared/db/prisma.js';
import { syncMerchantOrderById, syncPaymentById } from './billing.service.js';
import { HttpError } from '../../shared/http/errors.js';

function parseBody(req: Request) {
  if (Buffer.isBuffer(req.body)) {
    const raw = req.body.toString('utf8').trim();
    return raw ? JSON.parse(raw) : {};
  }
  return req.body || {};
}

function pickNotification(input: any, query: any) {
  const type = String(input.type || input.topic || query.type || query.topic || '').toLowerCase();
  const resourceId = String(input?.data?.id || input?.id || query['data.id'] || query.id || '').trim();
  return { type, resourceId };
}

function getProviderEventId(body: any, resourceId: string) {
  return String(body.id || resourceId || Date.now());
}

function isExpectedWebhookState(err: any) {
  const status = Number(err?.status || 0);
  const message = String(err?.message || '').toLowerCase();
  return (
    (status === 404 && message.includes('payment not found')) ||
    message.includes('merchant order sem pagamento aprovado') ||
    message.includes('payment not found')
  );
}

export async function mercadoPagoWebhook(req: Request, res: Response) {
  const body = parseBody(req);
  const { type, resourceId } = pickNotification(body, req.query);

  try {
    let result: any = null;
    if (type === 'payment' && resourceId) {
      result = await syncPaymentById(resourceId, body);
    } else if (type === 'merchant_order' && resourceId) {
      result = await syncMerchantOrderById(resourceId, body);
    } else {
      await prisma.billingWebhookEvent.upsert({
        where: {
          provider_eventType_providerEventId: {
            provider: 'MERCADO_PAGO',
            eventType: type || 'unknown',
            providerEventId: getProviderEventId(body, resourceId),
          },
        },
        create: {
          provider: 'MERCADO_PAGO',
          eventType: type || 'unknown',
          providerEventId: getProviderEventId(body, resourceId),
          resourceId: resourceId || null,
          processed: false,
          payload: body,
          error: 'Unsupported Mercado Pago webhook payload',
        },
        update: {
          resourceId: resourceId || null,
          processed: false,
          payload: body,
          error: 'Unsupported Mercado Pago webhook payload',
          processedAt: null,
        },
      });
    }
    return res.json({ received: true, processed: Boolean(result), state: result?.state || 'processed' });
  } catch (err: any) {
    const providerEventId = getProviderEventId(body, resourceId);
    if (isExpectedWebhookState(err)) {
      console.warn('[billing.mercadopagoWebhook.expected]', {
        status: err?.status,
        message: err?.message,
        body,
      });
      try {
        await prisma.billingWebhookEvent.upsert({
          where: { provider_eventType_providerEventId: { provider: 'MERCADO_PAGO', eventType: type || 'unknown', providerEventId } },
          create: {
            provider: 'MERCADO_PAGO',
            eventType: type || 'unknown',
            providerEventId,
            resourceId: resourceId || null,
            processed: false,
            payload: body,
            error: err?.message || 'Expected transient webhook state',
          },
          update: {
            resourceId: resourceId || null,
            processed: false,
            payload: body,
            error: err?.message || 'Expected transient webhook state',
            processedAt: null,
          },
        });
      } catch {}
      return res.status(200).json({ received: true, processed: false, ignored: true, reason: err?.message || 'Expected transient webhook state' });
    }

    console.error('[billing.mercadopagoWebhook]', { message: err?.message, stack: err?.stack, body });
    try {
      await prisma.billingWebhookEvent.upsert({
        where: { provider_eventType_providerEventId: { provider: 'MERCADO_PAGO', eventType: type || 'unknown', providerEventId } },
        create: {
          provider: 'MERCADO_PAGO',
          eventType: type || 'unknown',
          providerEventId,
          resourceId: resourceId || null,
          processed: false,
          payload: body,
          error: err?.message || 'Webhook handler failed',
        },
        update: {
          resourceId: resourceId || null,
          processed: false,
          payload: body,
          error: err?.message || 'Webhook handler failed',
          processedAt: null,
        },
      });
    } catch {}
    return res.status(err instanceof HttpError ? err.status : 500).json({ received: false });
  }
}

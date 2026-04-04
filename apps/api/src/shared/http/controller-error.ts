import type { Response } from 'express';
import { ZodError } from 'zod';
import { fail } from './response.js';

export function handleControllerError(res: Response, error: unknown, context: string) {
  const e = error as any;

  if (error instanceof ZodError) {
    const message = error.issues[0]?.message || 'Dados inválidos';
    return fail(res, 400, message, error.flatten());
  }

  const status = Number(e?.status || 500);

  if (status >= 400 && status < 500) {
    return fail(res, status, e?.message || 'Request failed', e?.details);
  }

  console.error(`[${context}]`, {
    message: e?.message,
    code: e?.code,
    meta: e?.meta,
    stack: e?.stack,
  });

  return fail(
    res,
    500,
    e?.code === 'P2022' || String(e?.message || '').includes('column')
      ? 'Banco desatualizado. Rode as migrations antes de tentar novamente.'
      : 'Não foi possível processar sua solicitação.',
  );
}

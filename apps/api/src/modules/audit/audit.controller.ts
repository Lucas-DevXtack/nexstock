import { Request, Response } from 'express';
import { ok, fail } from '../../shared/http/response.js';
import { listAuditLogs } from './audit.service.js';

export async function getAuditLogs(req: Request, res: Response) {
  try {
    return ok(res, await listAuditLogs(req.tenantId!, req.userId!, {
      action: typeof req.query.action === 'string' ? req.query.action : undefined,
      entity: typeof req.query.entity === 'string' ? req.query.entity : undefined,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
    }));
  } catch (e: any) {
    return fail(res, e.status || 500, e.message || 'Error', e.details);
  }
}

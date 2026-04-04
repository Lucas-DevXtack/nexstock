import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma.js';

export function audit(action: string, entity: string, entityIdFn?: (req: Request, res: Response) => string | undefined) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', async () => {
      try {
        if (!req.tenantId) return;
        if (res.statusCode >= 400) return;

        const entityId = entityIdFn ? entityIdFn(req, res) : undefined;

        await prisma.auditLog.create({
          data: {
            tenantId: req.tenantId,
            userId: req.userId,
            action,
            entity,
            entityId,
            meta: {
              method: req.method,
              path: req.originalUrl,
              ms: Date.now() - start,
              ip: req.ip,
            },
          },
        });
      } catch {
        // never block response
      }
    });
    next();
  };
}

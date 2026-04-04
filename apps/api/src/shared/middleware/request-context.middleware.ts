import type { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export function attachRequestContext(req: Request, res: Response, next: NextFunction) {
  const requestId = String(req.headers['x-request-id'] || crypto.randomUUID());
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}

import { Request, Response, NextFunction } from 'express';
import { fail } from '../../../shared/http/response.js';
import { prisma } from '../../../shared/db/prisma.js';
import { verifyToken } from '../utils/jwt.js';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return fail(res, 401, 'Missing token');
  try {
    const decoded = verifyToken(token);
    req.userId = decoded.sub;
    return next();
  } catch {
    return fail(res, 401, 'Invalid token');
  }
}

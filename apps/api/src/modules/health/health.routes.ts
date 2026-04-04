import { Router } from 'express';
import { prisma } from '../../shared/db/prisma.js';

export const healthRoutes = Router();
healthRoutes.get('/', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: 'up' });
  } catch {
    res.status(500).json({ ok: false, db: 'down' });
  }
});

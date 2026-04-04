import { Router } from 'express';
import { requireAuth } from '../auth/guards/auth.guard.js';
import { getUnits } from './units.controller.js';
export const unitsRoutes = Router();
unitsRoutes.get('/', requireAuth, getUnits);

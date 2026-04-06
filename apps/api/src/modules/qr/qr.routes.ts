import { Router } from 'express';
import { qrRedirect } from './qr.controller.js';

export const qrRoutes = Router();

qrRoutes.get('/', qrRedirect);
qrRoutes.get('/:slug', qrRedirect);

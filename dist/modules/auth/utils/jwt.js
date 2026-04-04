import jwt from 'jsonwebtoken';
import { env } from '../../../config/env.js';
export const signToken = (sub, expiresIn = '7d') => jwt.sign({ sub }, env.JWT_SECRET, { expiresIn });
export const verifyToken = (token) => jwt.verify(token, env.JWT_SECRET);

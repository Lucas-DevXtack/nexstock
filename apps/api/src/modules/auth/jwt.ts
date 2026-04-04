import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export function signAccessToken(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: '15m' });
}

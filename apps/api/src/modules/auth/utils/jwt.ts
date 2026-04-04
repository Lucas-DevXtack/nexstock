import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../../config/env.js';

export const signToken = (sub: string, expiresIn: SignOptions['expiresIn'] = '7d') =>
  jwt.sign({ sub }, env.JWT_SECRET as jwt.Secret, { expiresIn });

export const verifyToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET as jwt.Secret) as any;

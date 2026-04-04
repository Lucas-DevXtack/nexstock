import bcrypt from 'bcryptjs';
export async function hashPassword(raw) { const salt = await bcrypt.genSalt(10); return bcrypt.hash(raw, salt); }
export async function verifyPassword(raw, hashed) { return bcrypt.compare(raw, hashed); }

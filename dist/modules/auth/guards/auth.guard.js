import { fail } from '../../../shared/http/response.js';
import { verifyToken } from '../utils/jwt.js';
export function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token)
        return fail(res, 401, 'Missing token');
    try {
        const decoded = verifyToken(token);
        req.userId = decoded.sub;
        return next();
    }
    catch {
        return fail(res, 401, 'Invalid token');
    }
}

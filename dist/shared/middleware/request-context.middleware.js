import crypto from 'crypto';
export function attachRequestContext(req, res, next) {
    const requestId = String(req.headers['x-request-id'] || crypto.randomUUID());
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    next();
}

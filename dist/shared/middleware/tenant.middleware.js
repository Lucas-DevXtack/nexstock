import { fail } from '../http/response.js';
export function requireTenant(req, res, next) {
    const tenantId = req.headers['x-tenant-id'] || '';
    if (!tenantId)
        return fail(res, 400, 'Missing X-Tenant-Id header');
    req.tenantId = tenantId;
    next();
}

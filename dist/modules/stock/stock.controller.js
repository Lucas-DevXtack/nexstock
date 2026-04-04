import { ok, fail } from '../../shared/http/response.js';
import { moveStock, getBalance } from './stock.service.js';
export async function postMove(req, res) { try {
    return ok(res, await moveStock(req.tenantId, req.body), 201);
}
catch (e) {
    return fail(res, e.status || 500, e.message || 'Error', e.details);
} }
export async function getStockBalance(req, res) { return ok(res, await getBalance(req.tenantId)); }

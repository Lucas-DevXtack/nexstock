import { ok, fail } from '../../shared/http/response.js';
import { listProducts, createProduct, updateProduct, archiveProduct, unarchiveProduct } from './products.service.js';
export async function getProducts(req, res) {
    try {
        const includeArchived = String(req.query.includeArchived || '') === 'true';
        return ok(res, await listProducts(req.tenantId, includeArchived));
    }
    catch (e) {
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
}
export async function postProducts(req, res) {
    try {
        return ok(res, await createProduct(req.tenantId, req.body), 201);
    }
    catch (e) {
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
}
export async function putProducts(req, res) {
    try {
        return ok(res, await updateProduct(req.tenantId, String(req.params.id || ''), req.body));
    }
    catch (e) {
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
}
export async function patchArchiveProduct(req, res) {
    try {
        return ok(res, await archiveProduct(req.tenantId, String(req.params.id || '')));
    }
    catch (e) {
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
}
export async function patchUnarchiveProduct(req, res) {
    try {
        return ok(res, await unarchiveProduct(req.tenantId, String(req.params.id || '')));
    }
    catch (e) {
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
}

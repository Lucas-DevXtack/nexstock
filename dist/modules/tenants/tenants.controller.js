import { ok } from '../../shared/http/response.js';
import { handleControllerError } from '../../shared/http/controller-error.js';
import { createTenantSchema, renameTenantSchema } from '../../shared/validation/tenant.schemas.js';
import { archiveTenant, closeTenant, createTenant, getTenantById, getTenantPolicy, listTenantsForUser, reactivateTenant, renameTenant } from './tenants.service.js';
export async function postTenant(req, res) {
    try {
        const { name } = createTenantSchema.parse(req.body || {});
        const t = await createTenant(req.userId, name);
        return ok(res, t, 201);
    }
    catch (e) {
        return handleControllerError(res, e, 'tenants.postTenant');
    }
}
export async function getTenantMe(req, res) {
    try {
        return ok(res, await getTenantById(req.tenantId));
    }
    catch (e) {
        return handleControllerError(res, e, 'tenants.getTenantMe');
    }
}
export async function getMyTenants(req, res) {
    try {
        return ok(res, await listTenantsForUser(req.userId));
    }
    catch (e) {
        return handleControllerError(res, e, 'tenants.getMyTenants');
    }
}
export async function patchTenantName(req, res) {
    try {
        const { name } = renameTenantSchema.parse(req.body || {});
        return ok(res, await renameTenant(req.params.id, req.userId, name));
    }
    catch (e) {
        return handleControllerError(res, e, 'tenants.patchTenantName');
    }
}
export async function patchTenantArchive(req, res) {
    try {
        return ok(res, await archiveTenant(req.params.id, req.userId));
    }
    catch (e) {
        return handleControllerError(res, e, 'tenants.patchTenantArchive');
    }
}
export async function patchTenantReactivate(req, res) {
    try {
        return ok(res, await reactivateTenant(req.params.id, req.userId));
    }
    catch (e) {
        return handleControllerError(res, e, 'tenants.patchTenantReactivate');
    }
}
export async function patchTenantClose(req, res) {
    try {
        return ok(res, await closeTenant(req.params.id, req.userId));
    }
    catch (e) {
        return handleControllerError(res, e, 'tenants.patchTenantClose');
    }
}
export async function getTenantPermissions(req, res) {
    try {
        return ok(res, await getTenantPolicy(req.params.id, req.userId));
    }
    catch (e) {
        return handleControllerError(res, e, 'tenants.getTenantPermissions');
    }
}

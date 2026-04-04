import { ok, fail } from '../../shared/http/response.js';
import { acceptInvite, createInvite, getMemberPermissions, leaveCompany, listInvites, listMembers, removeMember, revokeInvite, setMemberPermissions, transferOwnership, updateMemberRole } from './members.service.js';
export async function getMembers(req, res) {
    try {
        return ok(res, await listMembers(req.tenantId));
    }
    catch (e) {
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
}
export async function getInvites(req, res) {
    try {
        return ok(res, await listInvites(req.tenantId));
    }
    catch (e) {
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
}
export async function postInvite(req, res) {
    try {
        return ok(res, await createInvite(req.tenantId, req.userId, req.body?.email, req.body?.role), 201);
    }
    catch (e) {
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
}
export async function deleteInvite(req, res) {
    try {
        return ok(res, await revokeInvite(req.tenantId, req.params.id));
    }
    catch (e) {
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
}
export async function postAcceptInvite(req, res) {
    try {
        return ok(res, await acceptInvite(req.userId, req.body?.token));
    }
    catch (e) {
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
}
export async function patchMemberRole(req, res) {
    try {
        return ok(res, await updateMemberRole(req.tenantId, req.userId, req.params.userId, req.body?.role));
    }
    catch (e) {
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
}
export async function getPermissions(req, res) {
    try {
        return ok(res, await getMemberPermissions(req.tenantId, req.userId, req.params.userId));
    }
    catch (e) {
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
}
export async function putPermissions(req, res) {
    try {
        return ok(res, await setMemberPermissions(req.tenantId, req.userId, req.params.userId, Array.isArray(req.body?.permissions) ? req.body.permissions : []));
    }
    catch (e) {
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
}
export async function postTransferOwnership(req, res) {
    try {
        return ok(res, await transferOwnership(req.tenantId, req.userId, req.params.userId));
    }
    catch (e) {
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
}
export async function deleteMember(req, res) {
    try {
        return ok(res, await removeMember(req.tenantId, req.userId, req.params.userId));
    }
    catch (e) {
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
}
export async function postLeaveCompany(req, res) {
    try {
        return ok(res, await leaveCompany(req.tenantId, req.userId));
    }
    catch (e) {
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
}

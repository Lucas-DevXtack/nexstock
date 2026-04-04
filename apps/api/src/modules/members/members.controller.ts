import { Request, Response } from 'express';
import { ok, fail } from '../../shared/http/response.js';
import { acceptInvite, createInvite, getMemberPermissions, leaveCompany, listInvites, listMembers, removeMember, revokeInvite, setMemberPermissions, transferOwnership, updateMemberRole } from './members.service.js';

export async function getMembers(req: Request, res: Response) {
  try { return ok(res, await listMembers(req.tenantId!)); }
  catch (e: any) { return fail(res, e.status || 500, e.message || 'Error', e.details); }
}

export async function getInvites(req: Request, res: Response) {
  try { return ok(res, await listInvites(req.tenantId!)); }
  catch (e: any) { return fail(res, e.status || 500, e.message || 'Error', e.details); }
}

export async function postInvite(req: Request, res: Response) {
  try { return ok(res, await createInvite(req.tenantId!, req.userId!, req.body?.email, req.body?.role), 201); }
  catch (e: any) { return fail(res, e.status || 500, e.message || 'Error', e.details); }
}

export async function deleteInvite(req: Request, res: Response) {
  try { return ok(res, await revokeInvite(req.tenantId!, req.params.id)); }
  catch (e: any) { return fail(res, e.status || 500, e.message || 'Error', e.details); }
}

export async function postAcceptInvite(req: Request, res: Response) {
  try { return ok(res, await acceptInvite(req.userId!, req.body?.token)); }
  catch (e: any) { return fail(res, e.status || 500, e.message || 'Error', e.details); }
}

export async function patchMemberRole(req: Request, res: Response) {
  try { return ok(res, await updateMemberRole(req.tenantId!, req.userId!, req.params.userId, req.body?.role)); }
  catch (e: any) { return fail(res, e.status || 500, e.message || 'Error', e.details); }
}

export async function getPermissions(req: Request, res: Response) {
  try { return ok(res, await getMemberPermissions(req.tenantId!, req.userId!, req.params.userId)); }
  catch (e: any) { return fail(res, e.status || 500, e.message || 'Error', e.details); }
}

export async function putPermissions(req: Request, res: Response) {
  try { return ok(res, await setMemberPermissions(req.tenantId!, req.userId!, req.params.userId, Array.isArray(req.body?.permissions) ? req.body.permissions : [])); }
  catch (e: any) { return fail(res, e.status || 500, e.message || 'Error', e.details); }
}

export async function postTransferOwnership(req: Request, res: Response) {
  try { return ok(res, await transferOwnership(req.tenantId!, req.userId!, req.params.userId)); }
  catch (e: any) { return fail(res, e.status || 500, e.message || 'Error', e.details); }
}

export async function deleteMember(req: Request, res: Response) {
  try { return ok(res, await removeMember(req.tenantId!, req.userId!, req.params.userId)); }
  catch (e: any) { return fail(res, e.status || 500, e.message || 'Error', e.details); }
}

export async function postLeaveCompany(req: Request, res: Response) {
  try { return ok(res, await leaveCompany(req.tenantId!, req.userId!)); }
  catch (e: any) { return fail(res, e.status || 500, e.message || 'Error', e.details); }
}

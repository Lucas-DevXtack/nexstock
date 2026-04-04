import { Router } from 'express';
import { requireAuth } from '../auth/guards/auth.guard.js';
import { requireTenant } from '../../shared/middleware/tenant.middleware.js';
import { requireTenantAccess } from '../../shared/middleware/tenant-access.middleware.js';
import { requireActiveTenant } from '../../shared/middleware/tenant-status.middleware.js';
import { loadTenantBilling } from '../billing/billing.middleware.js';
import { requirePlan } from '../billing/guards/plan.guard.js';
import { requireRole } from './guards/role.guard.js';
import { deleteInvite, deleteMember, getInvites, getMembers, getPermissions, patchMemberRole, postAcceptInvite, postInvite, postLeaveCompany, postTransferOwnership, putPermissions } from './members.controller.js';
import { MemberRoles } from './member-roles.js';

export const membersRoutes = Router();

membersRoutes.post('/accept', requireAuth, postAcceptInvite);

membersRoutes.use(requireAuth, requireTenant, requireTenantAccess, requireActiveTenant, loadTenantBilling, requirePlan('BUSINESS'));

membersRoutes.get('/', getMembers);
membersRoutes.get('/invites', requireRole(MemberRoles.MANAGER), getInvites);
membersRoutes.post('/invites', requireRole(MemberRoles.MANAGER), postInvite);
membersRoutes.delete('/invites/:id', requireRole(MemberRoles.MANAGER), deleteInvite);
membersRoutes.patch('/:userId/role', requireRole(MemberRoles.OWNER), patchMemberRole);
membersRoutes.get('/:userId/permissions', requireRole(MemberRoles.OWNER), getPermissions);
membersRoutes.put('/:userId/permissions', requireRole(MemberRoles.OWNER), putPermissions);

membersRoutes.post('/:userId/transfer-ownership', requireRole(MemberRoles.OWNER), postTransferOwnership);
membersRoutes.delete('/:userId', requireRole(MemberRoles.MANAGER), deleteMember);
membersRoutes.post('/leave', requireRole(MemberRoles.STAFF), postLeaveCompany);

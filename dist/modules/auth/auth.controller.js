import { ok } from '../../shared/http/response.js';
import { handleControllerError } from '../../shared/http/controller-error.js';
import { changePasswordSchema, deleteAccountSchema, loginSchema, signupSchema, updateMeSchema } from '../../shared/validation/auth.schemas.js';
import { signup, login, me, updateMe, changePassword, deleteAccount } from './auth.service.js';
export async function postSignup(req, res) {
    try {
        const { name, email, password } = signupSchema.parse(req.body || {});
        return ok(res, await signup(name, email, password), 201);
    }
    catch (e) {
        return handleControllerError(res, e, 'auth.postSignup');
    }
}
export async function postLogin(req, res) {
    try {
        const { email, password } = loginSchema.parse(req.body || {});
        return ok(res, await login(email, password));
    }
    catch (e) {
        return handleControllerError(res, e, 'auth.postLogin');
    }
}
export async function getMe(req, res) {
    return ok(res, await me(req.userId));
}
export async function patchMe(req, res) {
    try {
        const { name, avatarUrl } = updateMeSchema.parse(req.body || {});
        return ok(res, await updateMe(req.userId, { name, avatarUrl }));
    }
    catch (e) {
        return handleControllerError(res, e, 'auth.patchMe');
    }
}
export async function patchChangePassword(req, res) {
    try {
        const { currentPassword, newPassword } = changePasswordSchema.parse(req.body || {});
        return ok(res, await changePassword(req.userId, currentPassword, newPassword));
    }
    catch (e) {
        return handleControllerError(res, e, 'auth.patchChangePassword');
    }
}
export async function destroyAccount(req, res) {
    try {
        const { password } = deleteAccountSchema.parse(req.body || {});
        return ok(res, await deleteAccount(req.userId, password));
    }
    catch (e) {
        return handleControllerError(res, e, 'auth.destroyAccount');
    }
}

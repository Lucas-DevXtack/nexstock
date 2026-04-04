import { Request, Response } from 'express';
import { ok } from '../../shared/http/response.js';
import { handleControllerError } from '../../shared/http/controller-error.js';
import { changePasswordSchema, deleteAccountSchema, loginSchema, signupSchema, updateMeSchema } from '../../shared/validation/auth.schemas.js';
import { signup, login, me, updateMe, changePassword, deleteAccount } from './auth.service.js';

export async function postSignup(req: Request, res: Response) {
  try {
    const { name, email, password } = signupSchema.parse(req.body || {});
    return ok(res, await signup(name, email, password), 201);
  } catch (e: any) {
    return handleControllerError(res, e, 'auth.postSignup');
  }
}

export async function postLogin(req: Request, res: Response) {
  try {
    const { email, password } = loginSchema.parse(req.body || {});
    return ok(res, await login(email, password));
  } catch (e: any) {
    return handleControllerError(res, e, 'auth.postLogin');
  }
}

export async function getMe(req: Request, res: Response) {
  return ok(res, await me(req.userId!));
}

export async function patchMe(req: Request, res: Response) {
  try {
    const { name, avatarUrl } = updateMeSchema.parse(req.body || {});
    return ok(res, await updateMe(req.userId!, { name, avatarUrl }));
  } catch (e: any) {
    return handleControllerError(res, e, 'auth.patchMe');
  }
}

export async function patchChangePassword(req: Request, res: Response) {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body || {});
    return ok(res, await changePassword(req.userId!, currentPassword, newPassword));
  } catch (e: any) {
    return handleControllerError(res, e, 'auth.patchChangePassword');
  }
}

export async function destroyAccount(req: Request, res: Response) {
  try {
    const { password } = deleteAccountSchema.parse(req.body || {});
    return ok(res, await deleteAccount(req.userId!, password));
  } catch (e: any) {
    return handleControllerError(res, e, 'auth.destroyAccount');
  }
}

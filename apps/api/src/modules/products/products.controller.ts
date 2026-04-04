import { Request, Response } from 'express';
import { ok, fail } from '../../shared/http/response.js';
import { listProducts, createProduct, updateProduct, archiveProduct, unarchiveProduct } from './products.service.js';

export async function getProducts(req: Request, res: Response) {
  try {
    const includeArchived = String(req.query.includeArchived || '') === 'true';
    return ok(res, await listProducts(req.tenantId!, includeArchived));
  } catch (e: any) {
    return fail(res, e.status || 500, e.message || 'Error', e.details);
  }
}

export async function postProducts(req: Request, res: Response) {
  try {
    return ok(res, await createProduct(req.tenantId!, req.body), 201);
  } catch (e: any) {
    return fail(res, e.status || 500, e.message || 'Error', e.details);
  }
}

export async function putProducts(req: Request, res: Response) {
  try {
    return ok(res, await updateProduct(req.tenantId!, String(req.params.id || ''), req.body));
  } catch (e: any) {
    return fail(res, e.status || 500, e.message || 'Error', e.details);
  }
}

export async function patchArchiveProduct(req: Request, res: Response) {
  try {
    return ok(res, await archiveProduct(req.tenantId!, String(req.params.id || '')));
  } catch (e: any) {
    return fail(res, e.status || 500, e.message || 'Error', e.details);
  }
}

export async function patchUnarchiveProduct(req: Request, res: Response) {
  try {
    return ok(res, await unarchiveProduct(req.tenantId!, String(req.params.id || '')));
  } catch (e: any) {
    return fail(res, e.status || 500, e.message || 'Error', e.details);
  }
}

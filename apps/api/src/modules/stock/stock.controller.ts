import { Request,Response } from 'express';
import { ok, fail } from '../../shared/http/response.js';
import { moveStock, getBalance } from './stock.service.js';
export async function postMove(req:Request,res:Response){try{return ok(res,await moveStock(req.tenantId!,req.body),201);}catch(e:any){return fail(res,e.status||500,e.message||'Error',e.details);}}
export async function getStockBalance(req:Request,res:Response){return ok(res,await getBalance(req.tenantId!));}

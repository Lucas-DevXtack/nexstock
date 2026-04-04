import { Request,Response } from 'express';
import { ok, fail } from '../../shared/http/response.js';
import { listTransactions, createTransaction } from './finance.service.js';
export async function getTransactions(req:Request,res:Response){return ok(res,await listTransactions(req.tenantId!));}
export async function postTransactions(req:Request,res:Response){try{return ok(res,await createTransaction(req.tenantId!,req.body),201);}catch(e:any){return fail(res,e.status||500,e.message||'Error',e.details);}}

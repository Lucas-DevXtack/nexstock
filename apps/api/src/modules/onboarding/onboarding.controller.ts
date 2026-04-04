import { Request,Response } from 'express';
import { ok, fail } from '../../shared/http/response.js';
import { submitOnboarding, getOnboardingStatus } from './onboarding.service.js';
export async function getOnboarding(req:Request,res:Response){return ok(res,await getOnboardingStatus(req.tenantId!));}
export async function postOnboarding(req:Request,res:Response){try{return ok(res,await submitOnboarding(req.tenantId!,req.body),201);}catch(e:any){return fail(res,e.status||500,e.message||'Error',e.details);}}

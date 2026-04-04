import { Request,Response,NextFunction } from 'express';
import { fail } from '../../../shared/http/response.js';
export function requireFeature(flag:string){return (req:Request,res:Response,next:NextFunction)=>{ if(!req.flags?.[flag]) return fail(res,403,`Feature disabled: ${flag}`); next(); };}

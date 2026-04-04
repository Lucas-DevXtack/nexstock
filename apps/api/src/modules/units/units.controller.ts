import { Request,Response } from 'express';
import { ok } from '../../shared/http/response.js';
import { listUnits } from './units.service.js';
export async function getUnits(_req:Request,res:Response){return ok(res,await listUnits());}

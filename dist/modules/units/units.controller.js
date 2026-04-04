import { ok } from '../../shared/http/response.js';
import { listUnits } from './units.service.js';
export async function getUnits(_req, res) { return ok(res, await listUnits()); }

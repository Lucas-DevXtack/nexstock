import { fail } from '../../../shared/http/response.js';
export function requireFeature(flag) { return (req, res, next) => { if (!req.flags?.[flag])
    return fail(res, 403, `Feature disabled: ${flag}`); next(); }; }

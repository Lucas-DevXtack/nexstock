export const ok = (res, data, status = 200) => res.status(status).json({ ok: true, data });
export const fail = (res, status, message, details) => res.status(status).json({ ok: false, message, details });

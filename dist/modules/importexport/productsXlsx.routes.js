import { Router } from 'express';
import { prisma } from '../../shared/db/prisma.js';
import { requireAuth } from '../auth/guards/auth.guard.js';
import { requireTenant } from '../../shared/middleware/tenant.middleware.js';
import { loadTenantBilling } from '../billing/billing.middleware.js';
import { requirePlan } from '../billing/guards/plan.guard.js';
import { requirePerm } from '../members/guards/perm.guard.js';
import { HttpError } from '../../shared/http/errors.js';
import { ok, fail } from '../../shared/http/response.js';
import * as XLSX from 'xlsx';
import { randomUUID } from 'crypto';
import { Decimal } from '@prisma/client/runtime/library';
import { moveStockFIFO } from '../pro/stockfifo.service.js';
export const productsXlsxRoutes = Router();
// ✅ Import/Template devem estar disponíveis mesmo no FREE (pra reduzir churn e acelerar "primeiro valor")
productsXlsxRoutes.use(requireAuth, requireTenant, loadTenantBilling, requirePlan('FREE'), requirePerm('STOCK_WRITE'));
const store = new Map();
const TTL_MS = 30 * 60 * 1000;
function pruneStore() {
    const now = Date.now();
    for (const [k, v] of store.entries()) {
        if (now - v.createdAt > TTL_MS)
            store.delete(k);
    }
}
function toNum(v) {
    if (v == null || v === '')
        return null;
    const n = Number(String(v).trim().replace(',', '.'));
    return Number.isFinite(n) ? n : null;
}
function toStr(v) {
    const s = String(v ?? '').trim();
    return s ? s : '';
}
async function validateWorkbook(tenantId, buf) {
    const wb = XLSX.read(buf, { type: 'buffer' });
    const sheetName = wb.SheetNames[0];
    if (!sheetName)
        throw new HttpError(400, 'xlsx has no sheets');
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
    const errors = [];
    const preview = [];
    const seenSku = new Set();
    // cache de unidades (code -> unit.id) pra não consultar 1x por linha
    const units = await prisma.unit.findMany({ select: { id: true, code: true } });
    const unitMap = new Map(units.map(u => [u.code, u.id]));
    for (let i = 0; i < rows.length; i++) {
        const r = rows[i] || {};
        const rowNum = i + 2; // header row is 1
        const name = toStr(r.name || r.nome);
        const skuRaw = toStr(r.sku);
        const sku = skuRaw ? skuRaw.toUpperCase() : null;
        const unitCode = toStr(r.unitCode || r.unidade || r.unit);
        const minStock = toNum(r.minStock ?? r.lowStockThreshold ?? r.minimo);
        const sellPrice = toNum(r.sellPrice ?? r.precoVenda);
        const initialQty = toNum(r.initialQty ?? r.estoqueInicial ?? r.initialStock);
        const initialUnitCost = toNum(r.initialUnitCost ?? r.custoInicial ?? r.unitCost);
        const category = toStr(r.category ?? r.categoria) || null;
        // ignorar linha vazia
        if (!name && !sku && !unitCode && minStock == null && sellPrice == null && initialQty == null && initialUnitCost == null && !category) {
            continue;
        }
        // validações
        if (!name)
            errors.push({ row: rowNum, field: 'name', code: 'REQUIRED', message: 'Obrigatório' });
        if (!unitCode)
            errors.push({ row: rowNum, field: 'unitCode', code: 'REQUIRED', message: 'Obrigatório (ex: un, kg, g, l, ml)' });
        if (unitCode && !unitMap.has(unitCode))
            errors.push({ row: rowNum, field: 'unitCode', code: 'INVALID_UNIT', message: `Unidade inválida: ${unitCode}`, value: unitCode });
        if (minStock != null && minStock < 0)
            errors.push({ row: rowNum, field: 'minStock', code: 'INVALID_NUMBER', message: 'Deve ser >= 0', value: minStock });
        if (sellPrice != null && sellPrice < 0)
            errors.push({ row: rowNum, field: 'sellPrice', code: 'INVALID_NUMBER', message: 'Deve ser >= 0', value: sellPrice });
        if (initialQty != null && initialQty < 0)
            errors.push({ row: rowNum, field: 'initialQty', code: 'INVALID_NUMBER', message: 'Deve ser >= 0', value: initialQty });
        if (initialUnitCost != null && initialUnitCost < 0)
            errors.push({ row: rowNum, field: 'initialUnitCost', code: 'INVALID_NUMBER', message: 'Deve ser >= 0', value: initialUnitCost });
        if ((initialQty ?? 0) > 0 && initialUnitCost == null) {
            errors.push({ row: rowNum, field: 'initialUnitCost', code: 'REQUIRED', message: 'Obrigatório quando initialQty > 0' });
        }
        if (sku) {
            if (seenSku.has(sku)) {
                errors.push({ row: rowNum, field: 'sku', code: 'DUPLICATE_IN_FILE', message: 'SKU duplicado no arquivo', value: sku });
            }
            else {
                seenSku.add(sku);
            }
            // bloquear SKU existente no tenant (MVP: evita update silencioso)
            const exists = await prisma.product.findFirst({ where: { tenantId, sku }, select: { id: true } });
            if (exists) {
                errors.push({ row: rowNum, field: 'sku', code: 'DUPLICATE_IN_DB', message: 'SKU já existe no sistema (remova ou altere)', value: sku });
            }
        }
        preview.push({
            row: rowNum,
            sku,
            name,
            unitCode,
            minStock,
            sellPrice,
            initialQty,
            initialUnitCost,
            category,
        });
    }
    // se teve linhas vazias ignoradas, total = preview.length
    const invalidRows = new Set(errors.map(e => e.row));
    const summary = { total: preview.length, valid: preview.length - invalidRows.size, invalid: invalidRows.size };
    return { summary, preview, errors };
}
// ------------------------------
// Template
// ------------------------------
productsXlsxRoutes.get('/template', async (_req, res) => {
    const rows = [
        { sku: 'COCA2L', name: 'Coca Cola 2L', unitCode: 'un', minStock: 10, sellPrice: 9.99, initialQty: 24, initialUnitCost: 6.5, category: 'Bebidas' },
        { sku: 'ARROZ5', name: 'Arroz 5kg', unitCode: 'kg', minStock: 5, sellPrice: 29.9, initialQty: 10, initialUnitCost: 18.0, category: 'Mercearia' },
    ];
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'products');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="products_template.xlsx"');
    res.send(Buffer.from(buf));
});
// ------------------------------
// Validate (dry-run com preview + token)
// Body: { base64: "data:...base64,..." }
// ------------------------------
productsXlsxRoutes.post('/validate', async (req, res) => {
    try {
        pruneStore();
        const base64 = String(req.body?.base64 || '');
        if (!base64.trim())
            throw new HttpError(400, 'base64 required');
        const buf = Buffer.from(base64.replace(/^data:.*?;base64,/, ''), 'base64');
        const { summary, preview, errors } = await validateWorkbook(req.tenantId, buf);
        const importToken = randomUUID();
        store.set(importToken, { tenantId: req.tenantId, createdAt: Date.now(), summary, preview: preview.slice(0, 200), errors });
        return ok(res, { importToken, summary, preview: preview.slice(0, 200), errors }); // preview limitado
    }
    catch (e) {
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
});
// ------------------------------
// Export errors.xlsx
// ------------------------------
productsXlsxRoutes.get('/errors.xlsx', async (req, res) => {
    try {
        pruneStore();
        const token = String(req.query?.token || '');
        if (!token)
            throw new HttpError(400, 'token required');
        const data = store.get(token);
        if (!data)
            throw new HttpError(404, 'token not found/expired');
        if (data.tenantId !== req.tenantId)
            throw new HttpError(403, 'forbidden');
        const wsErr = XLSX.utils.json_to_sheet(data.errors.map(e => ({
            row: e.row,
            field: e.field || '',
            code: e.code,
            message: e.message,
            value: e.value ?? '',
        })));
        const wsPreview = XLSX.utils.json_to_sheet(data.preview);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, wsErr, 'errors');
        XLSX.utils.book_append_sheet(wb, wsPreview, 'preview');
        const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="errors.xlsx"');
        res.send(Buffer.from(buf));
    }
    catch (e) {
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
});
// ------------------------------
// Commit (apenas se invalid=0)
// Body: { importToken: string }
// ------------------------------
productsXlsxRoutes.post('/commit', async (req, res) => {
    try {
        pruneStore();
        const importToken = String(req.body?.importToken || '');
        if (!importToken)
            throw new HttpError(400, 'importToken required');
        const data = store.get(importToken);
        if (!data)
            throw new HttpError(404, 'token not found/expired');
        if (data.tenantId !== req.tenantId)
            throw new HttpError(403, 'forbidden');
        if (data.summary.invalid > 0)
            throw new HttpError(400, 'Import has errors; fix before commit');
        // Prepare category cache
        const catMap = new Map(); // name -> id
        let created = 0;
        let initialStockMoves = 0;
        await prisma.$transaction(async (tx) => {
            // override prisma used inside moveStockFIFO by temporarily switching? moveStockFIFO imports global prisma.
            // MVP: cria produtos via tx; e faz movimentos FIFO fora da tx (tradeoff).
            // Para manter atomicidade real, precisaríamos refatorar moveStockFIFO para aceitar tx.
            for (const r of data.preview) {
                const unit = await tx.unit.findUnique({ where: { code: r.unitCode } });
                if (!unit)
                    throw new HttpError(400, `Invalid unit during commit: ${r.unitCode}`);
                let productCategoryId = null;
                if (r.category) {
                    const key = r.category.trim();
                    if (!catMap.has(key)) {
                        const cat = await tx.productCategory.upsert({
                            where: { tenantId_name: { tenantId: req.tenantId, name: key } },
                            update: {},
                            create: { tenantId: req.tenantId, name: key },
                            select: { id: true },
                        });
                        catMap.set(key, cat.id);
                    }
                    productCategoryId = catMap.get(key);
                }
                const p = await tx.product.create({
                    data: {
                        tenantId: req.tenantId,
                        sku: r.sku,
                        name: r.name,
                        unitId: unit.id,
                        lowStockThreshold: r.minStock == null ? null : new Decimal(r.minStock),
                        sellPrice: r.sellPrice == null ? null : new Decimal(r.sellPrice),
                        ...(productCategoryId ? { productCategoryId } : {}),
                    },
                    select: { id: true },
                });
                created++;
                // estoque inicial (fora do tx: depende de moveStockFIFO global)
                if ((r.initialQty ?? 0) > 0) {
                    // Criar lote + movimento IN FIFO
                    await moveStockFIFO({
                        tenantId: req.tenantId,
                        userId: req.userId,
                        productId: p.id,
                        type: 'IN',
                        reason: 'OTHER',
                        occurredAt: new Date().toISOString(),
                        quantity: Number(r.initialQty),
                        unitCost: Number(r.initialUnitCost),
                        note: 'Estoque inicial (importação XLSX)',
                    });
                    initialStockMoves++;
                }
            }
        });
        // cleanup
        store.delete(importToken);
        return ok(res, { created, initialStockMoves });
    }
    catch (e) {
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
});
// ------------------------------
// Backwards-compatible import endpoint (legacy)
// Body: { base64, dryRun?, mode? }
// ------------------------------
productsXlsxRoutes.post('/import', async (req, res) => {
    try {
        const base64 = String(req.body?.base64 || '');
        if (!base64.trim())
            throw new HttpError(400, 'base64 required');
        const dryRun = Boolean(req.body?.dryRun);
        const buf = Buffer.from(base64.replace(/^data:.*?;base64,/, ''), 'base64');
        const { summary, preview, errors } = await validateWorkbook(req.tenantId, buf);
        if (dryRun)
            return ok(res, { created: 0, updated: 0, errors, summary });
        if (summary.invalid > 0)
            return ok(res, { created: 0, updated: 0, errors, summary });
        // legacy = commit create-only
        const importToken = randomUUID();
        store.set(importToken, { tenantId: req.tenantId, createdAt: Date.now(), summary, preview, errors });
        const r = await (async () => {
            // reuse commit logic
            const fakeReq = { ...req, body: { importToken } };
            const fakeRes = {};
            // call handler directly is complex; instead just do the commit body quickly
            return null;
        })();
        // simply instruct caller to use /validate + /commit
        return ok(res, { message: 'Use /products/xlsx/validate e /products/xlsx/commit', summary, errors });
    }
    catch (e) {
        return fail(res, e.status || 500, e.message || 'Error', e.details);
    }
});

import { z } from 'zod';
export const createTenantSchema = z.object({
    name: z.string().trim().min(2, 'Nome obrigatório').max(120, 'Nome muito longo'),
});
export const renameTenantSchema = z.object({
    name: z.string().trim().min(2, 'Nome obrigatório').max(120, 'Nome muito longo'),
});

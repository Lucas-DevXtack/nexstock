import { z } from 'zod';
export const signupSchema = z.object({
    name: z.string().trim().min(2, 'Nome inválido').max(120, 'Nome muito longo'),
    email: z.string().trim().email('Email inválido').transform((v) => v.toLowerCase()),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').max(128, 'Senha muito longa'),
});
export const loginSchema = z.object({
    email: z.string().trim().email('Email inválido').transform((v) => v.toLowerCase()),
    password: z.string().min(1, 'Senha obrigatória').max(128, 'Senha muito longa'),
});
export const updateMeSchema = z.object({
    name: z.string().trim().min(2, 'Nome inválido').max(120, 'Nome muito longo').optional(),
    avatarUrl: z.union([
        z.string().startsWith('data:image/', 'Formato de imagem inválido').max(2_500_000, 'Imagem muito grande'),
        z.literal(''),
        z.null(),
    ]).optional(),
});
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Senha atual obrigatória').max(128, 'Senha muito longa'),
    newPassword: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres').max(128, 'Senha muito longa'),
});
export const deleteAccountSchema = z.object({
    password: z.string().min(1, 'Senha obrigatória').max(128, 'Senha muito longa'),
});
export const refreshSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token obrigatório'),
});
export const forgotPasswordSchema = z.object({
    email: z.string().trim().email('Email inválido').transform((v) => v.toLowerCase()),
});
export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token obrigatório'),
    newPassword: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').max(128, 'Senha muito longa'),
});

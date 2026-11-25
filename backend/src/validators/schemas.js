import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter no mínimo 2 caracteres').max(80),
  email: z.string().trim().email('E-mail inválido').toLowerCase(),
  password: z
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter ao menos uma letra maiúscula')
    .regex(/[0-9]/, 'A senha deve conter ao menos um número'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('E-mail inválido').toLowerCase(),
  password: z.string().min(1, 'Senha obrigatória'),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual obrigatória'),
  newPassword: z
    .string()
    .min(8, 'A nova senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'A nova senha deve conter ao menos uma letra maiúscula')
    .regex(/[0-9]/, 'A nova senha deve conter ao menos um número'),
});

export const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.coerce.number().positive('O valor deve ser maior que zero').max(99999999.99),
  category: z.string().trim().min(1).max(60).optional(),
  categoryId: z.coerce.number().int().positive().nullable().optional(),
  accountId: z.coerce.number().int().positive().nullable().optional(),
  description: z.string().trim().min(2, 'Descrição muito curta').max(140),
  date: z.string().refine((val) => !Number.isNaN(Date.parse(val)), 'Data inválida'),
  notes: z.string().trim().max(500).nullable().optional(),
  isRecurring: z.boolean().optional().default(false),
  installments: z.coerce.number().int().min(1).max(60).optional().default(1),
});

export const importTransactionsSchema = z.object({
  accountId: z.coerce.number().int().positive().nullable().optional(),
  items: z
    .array(
      z.object({
        type: z.enum(['INCOME', 'EXPENSE']),
        amount: z.coerce.number().positive(),
        description: z.string().trim().min(1).max(140),
        date: z.string(),
        category: z.string().trim().min(1).max(60).default('Outros'),
        categoryId: z.coerce.number().int().positive().nullable().optional(),
      })
    )
    .min(1, 'Nenhuma transação selecionada para importação')
    .max(500),
});

export const goalSchema = z.object({
  title: z.string().trim().min(2).max(100),
  targetAmount: z.coerce.number().positive(),
  currentAmount: z.coerce.number().min(0).optional().default(0),
  deadline: z.string().nullable().optional(),
});

export const addGoalAmountSchema = z.object({
  amount: z.coerce.number().positive('O aporte deve ser maior que zero'),
});

export const budgetSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  amount: z.coerce.number().positive(),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
});

export const accountSchema = z.object({
  name: z.string().trim().min(2).max(60),
  type: z.enum(['CHECKING', 'CREDIT_CARD', 'CASH', 'SAVINGS']),
  balance: z.coerce.number().default(0),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6366f1'),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(50),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3b82f6'),
  icon: z.string().trim().min(1).max(30).default('Tag'),
});

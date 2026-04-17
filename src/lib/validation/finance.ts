import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(2).max(80),
  type: z.enum(["CASH", "BANK", "CRYPTO", "CREDIT"]),
  currency: z.string().length(3).default("USD"),
  openingBalance: z.number().int().default(0),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(60),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const transactionSchema = z.object({
  accountId: z.string().min(1),
  categoryId: z.string().optional().nullable(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  amountCents: z.number().int().positive(),
  note: z.string().max(500).optional().nullable(),
  occurredAt: z.string().datetime(),
});

export const budgetSchema = z.object({
  categoryId: z.string().optional().nullable(),
  accountId: z.string().optional().nullable(),
  periodMonth: z.string().datetime(),
  limitCents: z.number().int().positive(),
  alertThresholdPct: z.number().int().min(1).max(100).default(80),
});

export const profileSchema = z.object({
  fullName: z.string().min(2).max(80),
});

export const preferenceSchema = z.object({
  currency: z.string().length(3),
  locale: z.string().min(2).max(20),
  theme: z.enum(["light", "dark", "system"]),
  weekStart: z.enum(["monday", "sunday"]),
});

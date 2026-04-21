import { z } from "zod";

const accountTypeEnum = z.enum(["CASH", "BANK", "CRYPTO", "CREDIT"]);
const transactionTypeEnum = z.enum(["INCOME", "EXPENSE", "TRANSFER"]);
const themeEnum = z.enum(["light", "dark", "system"]);
const weekStartEnum = z.enum(["monday", "sunday"]);

export const accountSchema = z.object({
  name: z.string().min(2).max(80),
  type: accountTypeEnum,
  currency: z.string().length(3).default("USD"),
  openingBalance: z.number().int().default(0),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(60),
  type: transactionTypeEnum,
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const transactionSchema = z.object({
  accountId: z.string().min(1),
  categoryId: z.string().optional().nullable(),
  type: transactionTypeEnum,
  amountCents: z.number().int().positive(),
  note: z.string().max(500).optional().nullable(),
  occurredAt: z.string().datetime(),
});

export const transactionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  accountId: z.string().min(1).optional(),
  categoryId: z.string().min(1).optional(),
  type: transactionTypeEnum.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
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
  theme: themeEnum,
  weekStart: weekStartEnum,
});

export const onboardingSchema = z.object({
  fullName: z.string().min(2).max(80),
  currency: z.string().length(3),
  locale: z.string().min(2).max(20),
  weekStart: weekStartEnum,
});

import { z } from "zod";

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2).max(80),
  tenantName: z.string().min(2).max(80),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD'),
  licensePlate: z.string().min(2).max(12),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128),
  gdprConsentedAt: z.string().datetime(),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});

export const resendVerificationSchema = z.object({
  email: z.string().email().toLowerCase(),
});

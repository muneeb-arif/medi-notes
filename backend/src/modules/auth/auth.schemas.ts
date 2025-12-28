import { z } from 'zod';

const phoneRegex = /^\+?[1-9]\d{1,14}$/;

export const requestOtpSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(phoneRegex, 'Invalid phone number format'),
});

export const verifyOtpSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(phoneRegex, 'Invalid phone number format'),
  otp: z.string().length(5, 'OTP must be exactly 5 digits').regex(/^\d+$/, 'OTP must contain only digits'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const updateAccountSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  bloodGroup: z.string().min(1, 'Blood group is required'),
  dateOfBirth: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'), z.literal('')])
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  gender: z.enum(['male', 'female', 'other']).optional().nullable(),
  email: z
    .union([z.string().email('Invalid email format'), z.literal('')])
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  recoveryPhone: z
    .union([z.string(), z.literal('')])
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
});


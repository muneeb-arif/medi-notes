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


import { Request, Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../../middleware/auth';
import { HttpError } from '../../utils/httpError';
import { sendError, sendSuccess } from '../../utils/response';
import {
  logoutSchema,
  refreshTokenSchema,
  requestOtpSchema,
  updateAccountSchema,
  verifyOtpSchema,
} from './auth.schemas';
import { authService } from './auth.service';

const validateRequest = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new HttpError(400, 'VALIDATION_ERROR', result.error.errors[0]?.message || 'Invalid input');
  }
  return result.data;
};

export const authController = {
  requestOtp: async (req: Request, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const data = validateRequest(requestOtpSchema, req.body);
      const result = await authService.requestOtp(data, req);
      sendSuccess(res, result);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      // Log the actual error for debugging (no PHI)
      console.error('[OTP Request Error]', {
        message: error?.message,
        code: error?.code,
        requestId,
      });
      sendError(res, 'OTP_REQUEST_FAILED', error?.message || 'Failed to request OTP', 500, requestId);
    }
  },

  verifyOtp: async (req: Request, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const data = validateRequest(verifyOtpSchema, req.body);
      const result = await authService.verifyOtp(data, req);
      sendSuccess(res, result);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'OTP_VERIFICATION_FAILED', 'Failed to verify OTP', 500, requestId);
    }
  },

  refresh: async (req: Request, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const data = validateRequest(refreshTokenSchema, req.body);
      const tokens = await authService.refreshToken(data.refreshToken);
      sendSuccess(res, tokens);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'REFRESH_FAILED', 'Token refresh failed', 500, requestId);
    }
  },

  logout: async (req: Request, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const data = validateRequest(logoutSchema, req.body);
      await authService.logout(data.refreshToken);
      sendSuccess(res, { message: 'Logged out successfully' });
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'LOGOUT_FAILED', 'Logout failed', 500, requestId);
    }
  },

  getMe: async (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const accountId = req.accountId;
      if (!accountId) {
        return sendError(res, 'UNAUTHORIZED', 'Not authenticated', 401, requestId);
      }

      const account = await authService.getAccountById(accountId);
      if (!account) {
        return sendError(res, 'ACCOUNT_NOT_FOUND', 'Account not found', 404, requestId);
      }

      sendSuccess(res, account);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'FETCH_FAILED', 'Failed to fetch account', 500, requestId);
    }
  },

  updateMe: async (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const accountId = req.accountId;
      if (!accountId) {
        return sendError(res, 'UNAUTHORIZED', 'Not authenticated', 401, requestId);
      }

      const data = validateRequest(updateAccountSchema, req.body);
      const account = await authService.updateAccount(accountId, data);
      sendSuccess(res, account);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'UPDATE_FAILED', 'Failed to update account', 500, requestId);
    }
  },
};

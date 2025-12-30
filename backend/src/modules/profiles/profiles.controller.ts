import { Response } from 'express';
import { z } from 'zod';
import { HttpError } from '../../utils/httpError';
import { sendSuccess, sendError } from '../../utils/response';
import type { AuthRequest } from '../../middleware/auth';
import { profilesService } from './profiles.service';
import {
  createProfileSchema,
  profileSettingsSchema,
  updateProfileSchema,
} from './profiles.schemas';

const validateRequest = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new HttpError(400, 'VALIDATION_ERROR', result.error.errors[0]?.message || 'Invalid input');
  }
  return result.data;
};

export const profilesController = {
  list: async (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const accountId = req.accountId!;
      const profiles = await profilesService.list(accountId);
      sendSuccess(res, { items: profiles });
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'FETCH_FAILED', 'Failed to fetch profiles', 500, requestId);
    }
  },

  getById: async (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const accountId = req.accountId!;
      const profileId = req.params.profileId;
      const profile = await profilesService.getById(accountId, profileId);

      if (!profile) {
        return sendError(res, 'PROFILE_NOT_FOUND', 'Profile not found', 404, requestId);
      }

      sendSuccess(res, profile);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'FETCH_FAILED', 'Failed to fetch profile', 500, requestId);
    }
  },

  create: async (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const accountId = req.accountId!;
      const data = validateRequest(createProfileSchema, req.body);
      const profile = await profilesService.create(accountId, data);
      sendSuccess(res, profile, 201);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'CREATE_FAILED', 'Failed to create profile', 500, requestId);
    }
  },

  update: async (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const accountId = req.accountId!;
      const profileId = req.params.profileId;
      const data = validateRequest(updateProfileSchema, req.body);

      try {
        const profile = await profilesService.update(accountId, profileId, data);
        sendSuccess(res, profile);
      } catch (error: any) {
        if (error.message === 'PROFILE_NOT_FOUND') {
          return sendError(res, 'PROFILE_NOT_FOUND', 'Profile not found', 404, requestId);
        }
        throw error;
      }
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'UPDATE_FAILED', 'Failed to update profile', 500, requestId);
    }
  },

  delete: async (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const accountId = req.accountId!;
      const profileId = req.params.profileId;

      try {
        await profilesService.delete(accountId, profileId);
        sendSuccess(res, { message: 'Profile deleted successfully' });
      } catch (error: any) {
        if (error.message === 'PROFILE_NOT_FOUND') {
          return sendError(res, 'PROFILE_NOT_FOUND', 'Profile not found', 404, requestId);
        }
        throw error;
      }
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'DELETE_FAILED', 'Failed to delete profile', 500, requestId);
    }
  },

  updateSettings: async (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const accountId = req.accountId!;
      const profileId = req.params.profileId;
      const data = validateRequest(profileSettingsSchema, req.body);

      try {
        const profile = await profilesService.updateSettings(accountId, profileId, data);
        sendSuccess(res, profile);
      } catch (error: any) {
        if (error.message === 'PROFILE_NOT_FOUND') {
          return sendError(res, 'PROFILE_NOT_FOUND', 'Profile not found', 404, requestId);
        }
        throw error;
      }
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'UPDATE_FAILED', 'Failed to update profile settings', 500, requestId);
    }
  },
};


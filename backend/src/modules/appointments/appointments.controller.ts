import { Response } from 'express';
import { z } from 'zod';
import { HttpError } from '../../utils/httpError';
import { sendSuccess, sendError } from '../../utils/response';
import type { AuthRequest } from '../../middleware/auth';
import { appointmentsService } from './appointments.service';
import { createAppointmentSchema, updateAppointmentSchema } from './appointments.schemas';

const validateRequest = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new HttpError(400, 'VALIDATION_ERROR', result.error.errors[0]?.message || 'Invalid input');
  }
  return result.data;
};

export const appointmentsController = {
  create: async (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const accountId = req.accountId;
      if (!accountId) {
        return sendError(res, 'UNAUTHORIZED', 'Not authenticated', 401, requestId);
      }

      const profileId = (req.query.profileId as string) || undefined;
      const data = validateRequest(createAppointmentSchema, req.body);
      const appointment = await appointmentsService.create(accountId, profileId, data);
      sendSuccess(res, appointment, 201);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'CREATE_FAILED', 'Failed to create appointment', 500, requestId);
    }
  },

  list: async (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const accountId = req.accountId;
      if (!accountId) {
        return sendError(res, 'UNAUTHORIZED', 'Not authenticated', 401, requestId);
      }

      const params: any = {};
      const profileId = (req.query.profileId as string) || undefined;

      if (req.query.status) {
        params.status = req.query.status;
      }
      if (req.query.from) {
        params.from = req.query.from;
      }
      if (req.query.to) {
        params.to = req.query.to;
      }
      if (req.query.page) {
        params.page = parseInt(req.query.page as string, 10);
      }
      if (req.query.limit) {
        params.limit = parseInt(req.query.limit as string, 10);
      }

      const result = await appointmentsService.list(accountId, profileId, params);
      sendSuccess(res, result);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      // Log the actual error for debugging (without PHI)
      console.error('[Appointments List Error]', {
        requestId,
        error: error?.message || String(error),
        stack: error?.stack,
      });
      sendError(res, 'FETCH_FAILED', 'Failed to fetch appointments', 500, requestId);
    }
  },

  getById: async (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const accountId = req.accountId;
      if (!accountId) {
        return sendError(res, 'UNAUTHORIZED', 'Not authenticated', 401, requestId);
      }

      const appointmentId = req.params.appointmentId;
      const appointment = await appointmentsService.getById(accountId, appointmentId);

      if (!appointment) {
        return sendError(res, 'APPOINTMENT_NOT_FOUND', 'Appointment not found', 404, requestId);
      }

      sendSuccess(res, appointment);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'FETCH_FAILED', 'Failed to fetch appointment', 500, requestId);
    }
  },

  update: async (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const accountId = req.accountId;
      if (!accountId) {
        return sendError(res, 'UNAUTHORIZED', 'Not authenticated', 401, requestId);
      }

      const appointmentId = req.params.appointmentId;
      const data = validateRequest(updateAppointmentSchema, req.body);
      const appointment = await appointmentsService.update(accountId, appointmentId, data);

      if (!appointment) {
        return sendError(res, 'APPOINTMENT_NOT_FOUND', 'Appointment not found', 404, requestId);
      }

      sendSuccess(res, appointment);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'UPDATE_FAILED', 'Failed to update appointment', 500, requestId);
    }
  },

  delete: async (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const accountId = req.accountId;
      if (!accountId) {
        return sendError(res, 'UNAUTHORIZED', 'Not authenticated', 401, requestId);
      }

      const appointmentId = req.params.appointmentId;
      const deleted = await appointmentsService.delete(accountId, appointmentId);

      if (!deleted) {
        return sendError(res, 'APPOINTMENT_NOT_FOUND', 'Appointment not found', 404, requestId);
      }

      sendSuccess(res, { message: 'Appointment deleted successfully' });
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'DELETE_FAILED', 'Failed to delete appointment', 500, requestId);
    }
  },
};


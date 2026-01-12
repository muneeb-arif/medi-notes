import { z } from 'zod';

export const uploadUrlSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
});

export const createReportSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  reportDate: z.string().min(1, 'Report date is required'),
  type: z.enum(['lab', 'radiology', 'prescription', 'visit_note', 'discharge', 'other']),
  doctorName: z.string().optional(),
  facility: z.string().optional(),
  tags: z.array(z.string()).optional(),
  conditionProfileId: z.string().optional(),
  fileKey: z.string().optional(),
  includeInEmergency: z.boolean().optional(),
});

export const updateReportSchema = z.object({
  title: z.string().min(1).optional(),
  reportDate: z.string().min(1).optional(),
  type: z.enum(['lab', 'radiology', 'prescription', 'visit_note', 'discharge', 'other']).optional(),
  doctorName: z.string().optional(),
  facility: z.string().optional(),
  tags: z.array(z.string()).optional(),
  includeInEmergency: z.boolean().optional(),
});


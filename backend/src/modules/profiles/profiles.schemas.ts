import { z } from 'zod';

export const createProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Profile name must be at least 2 characters')
    .refine((val) => val.trim().toLowerCase() !== 'general', {
      message: 'Cannot create another "General" profile. It is the system default.',
    }),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateProfileSchema = createProfileSchema.partial();

export const profileSettingsSchema = z.object({
  emergencyAccessEnabled: z.boolean(),
  doctorSharingEnabled: z.boolean(),
});

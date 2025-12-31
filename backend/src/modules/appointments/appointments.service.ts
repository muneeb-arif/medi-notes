import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from '../../utils/db';
import type {
  Appointment,
  AppointmentsListParams,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from './appointments.types';

export const appointmentsService = {
  create: async (
    accountId: string,
    profileId: string | undefined,
    data: CreateAppointmentInput
  ): Promise<Appointment> => {
    const appointmentId = uuidv4();

    // If profileId not provided, get default profile for account
    let finalProfileId = profileId;
    if (!finalProfileId) {
      const defaultProfile = await queryOne<{ id: string }>(
        `SELECT id FROM profiles WHERE account_id = $1 AND is_default = true LIMIT 1`,
        [accountId]
      );
      if (!defaultProfile) {
        throw new Error('NO_DEFAULT_PROFILE');
      }
      finalProfileId = defaultProfile.id;
    }

    // Verify profile belongs to account
    const profile = await queryOne<{ id: string }>(
      `SELECT id FROM profiles WHERE id = $1 AND account_id = $2`,
      [finalProfileId, accountId]
    );
    if (!profile) {
      throw new Error('PROFILE_NOT_FOUND');
    }

    await query(
      `INSERT INTO appointments (id, profile_id, title, specialty, doctor_name, facility, location, start_at, end_at, status, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
      [
        appointmentId,
        finalProfileId,
        data.title,
        data.specialty || null,
        data.doctorName || null,
        data.facility || null,
        data.location || null,
        data.startAt,
        data.endAt || null,
        data.status,
        data.notes || null,
      ]
    );

    const appointment = await appointmentsService.getById(accountId, appointmentId);
    if (!appointment) {
      throw new Error('APPOINTMENT_NOT_FOUND');
    }

    return appointment;
  },

  list: async (
    accountId: string,
    profileId: string | undefined,
    params?: AppointmentsListParams
  ): Promise<{ items: Appointment[]; meta: { page: number; limit: number; total: number } }> => {
    let whereConditions = ['p.account_id = $1'];
    const queryParams: any[] = [accountId];
    let paramIndex = 2;

    if (profileId) {
      whereConditions.push(`a.profile_id = $${paramIndex}`);
      queryParams.push(profileId);
      paramIndex++;
    }

    if (params?.status) {
      whereConditions.push(`a.status = $${paramIndex}`);
      queryParams.push(params.status);
      paramIndex++;
    }

    if (params?.from) {
      whereConditions.push(`a.start_at >= $${paramIndex}`);
      queryParams.push(params.from);
      paramIndex++;
    }

    if (params?.to) {
      whereConditions.push(`a.start_at <= $${paramIndex}`);
      queryParams.push(params.to);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    let total = 0;
    try {
      const countResult = await queryOne<{ count: string }>(
        `SELECT COUNT(*) as count FROM appointments a
         INNER JOIN profiles p ON a.profile_id = p.id
         WHERE ${whereClause}`,
        queryParams
      );
      total = parseInt(countResult?.count || '0', 10);
    } catch (error: any) {
      console.error('[Appointments Service] Count query failed:', {
        whereClause,
        queryParams: queryParams.map((p, i) => `$${i + 1}=${p}`).join(', '),
        error: error?.message || String(error),
      });
      throw error;
    }

    // Get paginated results
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const offset = (page - 1) * limit;

    const limitParam = paramIndex;
    const offsetParam = paramIndex + 1;
    const finalQueryParams = [...queryParams, limit, offset];

    let appointments;
    try {
      appointments = await query<{
        id: string;
        profile_id: string;
        title: string;
        specialty: string | null;
        doctor_name: string | null;
        facility: string | null;
        location: string | null;
        start_at: Date;
        end_at: Date | null;
        status: string;
        notes: string | null;
        created_at: Date;
      }>(
        `SELECT a.id, a.profile_id, a.title, a.specialty, a.doctor_name, a.facility, a.location, a.start_at, a.end_at, a.status, a.notes, a.created_at
         FROM appointments a
         INNER JOIN profiles p ON a.profile_id = p.id
         WHERE ${whereClause}
         ORDER BY a.start_at DESC
         LIMIT $${limitParam} OFFSET $${offsetParam}`,
        finalQueryParams
      );
    } catch (error: any) {
      console.error('[Appointments Service] List query failed:', {
        whereClause,
        limitParam,
        offsetParam,
        queryParams: finalQueryParams.map((p, i) => `$${i + 1}=${p}`).join(', '),
        error: error?.message || String(error),
      });
      throw error;
    }

    return {
      items: appointments.map((apt) => ({
        id: apt.id,
        profileId: apt.profile_id,
        title: apt.title,
        specialty: apt.specialty || undefined,
        doctorName: apt.doctor_name || undefined,
        facility: apt.facility || undefined,
        location: apt.location || undefined,
        startAt: apt.start_at.toISOString(),
        endAt: apt.end_at?.toISOString() || undefined,
        status: apt.status as 'scheduled' | 'completed' | 'cancelled',
        notes: apt.notes || undefined,
        createdAt: apt.created_at.toISOString(),
      })),
      meta: {
        page,
        limit,
        total,
      },
    };
  },

  getById: async (accountId: string, appointmentId: string): Promise<Appointment | undefined> => {
    const appointment = await queryOne<{
      id: string;
      profile_id: string;
      title: string;
      specialty: string | null;
      doctor_name: string | null;
      facility: string | null;
      location: string | null;
      start_at: Date;
      end_at: Date | null;
      status: string;
      notes: string | null;
      created_at: Date;
    }>(
      `SELECT a.id, a.profile_id, a.title, a.specialty, a.doctor_name, a.facility, a.location, a.start_at, a.end_at, a.status, a.notes, a.created_at
       FROM appointments a
       INNER JOIN profiles p ON a.profile_id = p.id
       WHERE a.id = $1 AND p.account_id = $2`,
      [appointmentId, accountId]
    );

    if (!appointment) {
      return undefined;
    }

    return {
      id: appointment.id,
      profileId: appointment.profile_id,
      title: appointment.title,
      specialty: appointment.specialty || undefined,
      doctorName: appointment.doctor_name || undefined,
      facility: appointment.facility || undefined,
      location: appointment.location || undefined,
      startAt: appointment.start_at.toISOString(),
      endAt: appointment.end_at?.toISOString() || undefined,
      status: appointment.status as 'scheduled' | 'completed' | 'cancelled',
      notes: appointment.notes || undefined,
      createdAt: appointment.created_at.toISOString(),
    };
  },

  update: async (
    accountId: string,
    appointmentId: string,
    data: UpdateAppointmentInput
  ): Promise<Appointment | null> => {
    // Verify appointment belongs to account
    const existing = await appointmentsService.getById(accountId, appointmentId);
    if (!existing) {
      return null;
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(data.title);
      paramIndex++;
    }
    if (data.specialty !== undefined) {
      updates.push(`specialty = $${paramIndex}`);
      values.push(data.specialty || null);
      paramIndex++;
    }
    if (data.doctorName !== undefined) {
      updates.push(`doctor_name = $${paramIndex}`);
      values.push(data.doctorName || null);
      paramIndex++;
    }
    if (data.facility !== undefined) {
      updates.push(`facility = $${paramIndex}`);
      values.push(data.facility || null);
      paramIndex++;
    }
    if (data.location !== undefined) {
      updates.push(`location = $${paramIndex}`);
      values.push(data.location || null);
      paramIndex++;
    }
    if (data.startAt !== undefined) {
      updates.push(`start_at = $${paramIndex}`);
      values.push(data.startAt);
      paramIndex++;
    }
    if (data.endAt !== undefined) {
      updates.push(`end_at = $${paramIndex}`);
      values.push(data.endAt || null);
      paramIndex++;
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      values.push(data.status);
      paramIndex++;
    }
    if (data.notes !== undefined) {
      updates.push(`notes = $${paramIndex}`);
      values.push(data.notes || null);
      paramIndex++;
    }

    if (updates.length === 0) {
      return existing;
    }

    values.push(appointmentId);

    await query(
      `UPDATE appointments
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}`,
      values
    );

    const appointment = await appointmentsService.getById(accountId, appointmentId);
    return appointment || null;
  },

  delete: async (accountId: string, appointmentId: string): Promise<boolean> => {
    // Check if appointment exists and belongs to account
    const appointment = await appointmentsService.getById(accountId, appointmentId);
    if (!appointment) {
      return false;
    }

    await query(`DELETE FROM appointments WHERE id = $1`, [appointmentId]);

    return true;
  },
};

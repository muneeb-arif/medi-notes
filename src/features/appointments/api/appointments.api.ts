import { apiClient } from '@services/apiClient';
import type {
  Appointment,
  AppointmentsListParams,
  AppointmentsListResponse,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '../types';

export const appointmentsApi = {
  list: async (
    activeProfileId: string | null | undefined,
    params?: AppointmentsListParams
  ): Promise<AppointmentsListResponse> => {
    const queryParams = new URLSearchParams();
    if (activeProfileId) queryParams.append('profileId', activeProfileId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.from) queryParams.append('from', params.from);
    if (params?.to) queryParams.append('to', params.to);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/appointments${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<AppointmentsListResponse>(endpoint);
  },

  getById: async (appointmentId: string): Promise<Appointment> => {
    return apiClient.get<Appointment>(`/appointments/${appointmentId}`);
  },

  create: async (
    activeProfileId: string | null | undefined,
    data: CreateAppointmentInput
  ): Promise<Appointment> => {
    const queryParams = new URLSearchParams();
    if (activeProfileId) queryParams.append('profileId', activeProfileId);
    const queryString = queryParams.toString();
    const endpoint = `/appointments${queryString ? `?${queryString}` : ''}`;
    return apiClient.post<Appointment>(endpoint, data);
  },

  update: async (
    appointmentId: string,
    data: UpdateAppointmentInput
  ): Promise<Appointment> => {
    return apiClient.put<Appointment>(`/appointments/${appointmentId}`, data);
  },

  delete: async (appointmentId: string): Promise<void> => {
    return apiClient.delete<void>(`/appointments/${appointmentId}`);
  },
};


import { useQuery } from '@tanstack/react-query';
import { appointmentsApi } from '../api/appointments.api';
import type { AppointmentsListParams } from '../types';

export const useAppointmentsList = (
  activeProfileId: string | null | undefined,
  params?: AppointmentsListParams
) => {
  return useQuery({
    queryKey: ['appointments', 'list', activeProfileId, params],
    queryFn: async () => {
      try {
        return await appointmentsApi.list(activeProfileId, params);
      } catch (error) {
        if (__DEV__) {
          console.error('Appointments list error:', error);
        }
        throw error;
      }
    },
    retry: 1,
  });
};


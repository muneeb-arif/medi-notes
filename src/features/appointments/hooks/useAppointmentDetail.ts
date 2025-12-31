import { useQuery } from '@tanstack/react-query';
import { appointmentsApi } from '../api/appointments.api';

export const useAppointmentDetail = (appointmentId: string | null) => {
  return useQuery({
    queryKey: ['appointments', 'detail', appointmentId],
    queryFn: () => {
      if (!appointmentId) {
        throw new Error('Appointment ID is required');
      }
      return appointmentsApi.getById(appointmentId);
    },
    enabled: !!appointmentId,
  });
};


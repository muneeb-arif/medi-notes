import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '../api/appointments.api';

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) => appointmentsApi.delete(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', 'list'] });
    },
  });
};


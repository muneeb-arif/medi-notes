import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '../api/appointments.api';
import type { UpdateAppointmentInput } from '../types';

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      data,
    }: {
      appointmentId: string;
      data: UpdateAppointmentInput;
    }) => appointmentsApi.update(appointmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'detail'] });
    },
  });
};


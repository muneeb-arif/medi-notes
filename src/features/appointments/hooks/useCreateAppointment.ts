import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '../api/appointments.api';
import type { CreateAppointmentInput } from '../types';

export const useCreateAppointment = (activeProfileId: string | null | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentInput) => appointmentsApi.create(activeProfileId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', 'list'] });
    },
  });
};


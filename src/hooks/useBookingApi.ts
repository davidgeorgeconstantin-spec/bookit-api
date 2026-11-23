import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/bookings';

export const useServices = () => useQuery({ queryKey: ['services'], queryFn: api.services, staleTime: Infinity });

export const useSlots = (serviceId: string | null, date: string) =>
  useQuery({ queryKey: ['slots', serviceId, date], queryFn: () => api.slots(serviceId!, date), enabled: !!serviceId });

export const useBookings = (page: number, status?: string) =>
  useQuery({ queryKey: ['bookings', page, status], queryFn: () => api.bookings(page, status), placeholderData: keepPreviousData });

/** After a change, invalidate cached lists so they are fetched again. */
export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.create,
    onSuccess: () => qc.invalidateQueries({ predicate: (q) => ['bookings', 'slots'].includes(q.queryKey[0] as string) }),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.cancel,
    onSuccess: () => qc.invalidateQueries({ predicate: (q) => ['bookings', 'slots'].includes(q.queryKey[0] as string) }),
  });
}

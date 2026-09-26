"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ADMIN_DASHBOARD_QUERY_KEY,
  ADMIN_INSTRUCTORS_QUERY_KEY,
  ADMIN_USERS_QUERY_KEY,
  adminUsersQueryKey,
} from "@/hooks/admin/admin-query-keys";
import { adminApi, type ModeratedRole } from "@/Services/admin.service";

export function useAdminUsers(role?: ModeratedRole) {
  return useQuery({
    queryKey: adminUsersQueryKey(role),
    queryFn: () => adminApi.getUsers(role),
  });
}

function useInvalidateUserQueries() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    // Instructor suspensions also change the instructor moderation list.
    queryClient.invalidateQueries({ queryKey: ADMIN_INSTRUCTORS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_QUERY_KEY });
  };
}

export function useSuspendUser() {
  const invalidate = useInvalidateUserQueries();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.suspendUser(id, reason),
    onSuccess: invalidate,
  });
}

export function useRemoveUser() {
  const invalidate = useInvalidateUserQueries();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.removeUser(id, reason),
    onSuccess: invalidate,
  });
}

export function useReinstateUser() {
  const invalidate = useInvalidateUserQueries();

  return useMutation({
    mutationFn: (userId: string) => adminApi.reinstateUser(userId),
    onSuccess: invalidate,
  });
}

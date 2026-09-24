"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ADMIN_DASHBOARD_QUERY_KEY,
  ADMIN_INSTRUCTORS_QUERY_KEY,
  ADMIN_USERS_QUERY_KEY,
  adminInstructorsQueryKey,
} from "@/hooks/admin/admin-query-keys";
import { adminApi } from "@/Services/admin.service";
import type { InstructorStatus } from "@/Services/auth.service";

export function useAdminInstructors(status?: InstructorStatus) {
  return useQuery({
    queryKey: adminInstructorsQueryKey(status),
    queryFn: () => adminApi.getInstructors(status),
  });
}

function useInvalidateInstructorQueries() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_INSTRUCTORS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_QUERY_KEY });
  };
}

export function useApproveInstructor() {
  const invalidate = useInvalidateInstructorQueries();

  return useMutation({
    mutationFn: (instructorId: string) =>
      adminApi.approveInstructor(instructorId),
    onSuccess: invalidate,
  });
}

export function useRejectInstructor() {
  const invalidate = useInvalidateInstructorQueries();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.rejectInstructor(id, reason),
    onSuccess: invalidate,
  });
}

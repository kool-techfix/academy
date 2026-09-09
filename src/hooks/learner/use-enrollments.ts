"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { learnerEnrollmentApi } from "@/Services/enrollment.service";

export const LEARNER_ENROLLMENTS_QUERY_KEY = [
  "learner",
  "enrollments",
] as const;

export function useLearnerEnrollments() {
  return useQuery({
    queryKey: LEARNER_ENROLLMENTS_QUERY_KEY,
    queryFn: learnerEnrollmentApi.getEnrollments,
    staleTime: 5 * 60 * 1000,
  });
}

export function useEnrollInCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: learnerEnrollmentApi.enroll,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: LEARNER_ENROLLMENTS_QUERY_KEY,
      });
    },
  });
}

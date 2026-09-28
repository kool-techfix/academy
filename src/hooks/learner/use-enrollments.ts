"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { learnerEnrollmentApi } from "@/Services/enrollment.service";
import { LEARNER_DASHBOARD_ACTIVITY_QUERY_KEY, LEARNER_DASHBOARD_STREAK_QUERY_KEY } from "./use-dashboard";

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

      queryClient.invalidateQueries({
        queryKey: LEARNER_DASHBOARD_ACTIVITY_QUERY_KEY,
      });
    },
  });

  queryClient.invalidateQueries({
    queryKey: LEARNER_DASHBOARD_STREAK_QUERY_KEY,
  });
}

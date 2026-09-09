"use client";

import { useQueries, useQuery } from "@tanstack/react-query";

import { learnerEnrollmentApi } from "@/Services/enrollment.service";

import { learnerProgressApi } from "@/Services/progress.service";

import { LEARNER_ENROLLMENTS_QUERY_KEY } from "@/hooks/learner/use-enrollments";

import { learnerCourseProgressQueryKey } from "@/hooks/learner/use-progress";

export function useLearnerDashboardCourses() {
  const {
    data: enrollments,
    isLoading: enrollmentsLoading,
    isError: enrollmentsError,
  } = useQuery({
    queryKey: LEARNER_ENROLLMENTS_QUERY_KEY,
    queryFn: learnerEnrollmentApi.getEnrollments,
    staleTime: 5 * 60 * 1000,
  });

  const progressQueries = useQueries({
    queries:
      enrollments?.map((enrollment) => ({
        queryKey: learnerCourseProgressQueryKey(enrollment.courseId),
        queryFn: () =>
          learnerProgressApi.getCourseProgress(enrollment.courseId),
        staleTime: 60 * 1000,
      })) ?? [],
  });

  const isLoading =
    enrollmentsLoading || progressQueries.some((query) => query.isLoading);

  const isError =
    enrollmentsError || progressQueries.some((query) => query.isError);

  const courses =
    enrollments?.map((enrollment, index) => ({
      enrollment,
      progress: progressQueries[index]?.data ?? null,
    })) ?? [];

  return {
    courses,
    isLoading,
    isError,
  };
}

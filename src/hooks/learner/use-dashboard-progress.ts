"use client";

import { useQueries } from "@tanstack/react-query";

import {
  learnerProgressApi,
} from "@/Services/progress.service";

import {
  learnerCourseProgressQueryKey,
} from "@/hooks/learner/use-progress";

export function useLearnerDashboardProgress(
  courseIds: string[],
) {
  return useQueries({
    queries: courseIds.map((courseId) => ({
      queryKey: learnerCourseProgressQueryKey(courseId),
      queryFn: () =>
        learnerProgressApi.getCourseProgress(courseId),
      enabled: Boolean(courseId),
      staleTime: 60 * 1000,
    })),
  });
}
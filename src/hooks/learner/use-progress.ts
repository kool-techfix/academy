"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LEARNER_DASHBOARD_ACTIVITY_QUERY_KEY,
  LEARNER_DASHBOARD_STREAK_QUERY_KEY,
} from "@/hooks/learner/use-dashboard";
import { learnerProgressApi } from "@/Services/progress.service";

export const LEARNER_ALL_COURSE_PROGRESS_QUERY_KEY = [
  "learner",
  "progress",
  "all",
] as const;

export const learnerCourseProgressQueryKey = (courseId: string) =>
  ["learner", "progress", courseId] as const;

/** `enabled: false` skips the request (e.g. the learner isn't enrolled). */
export function useLearnerCourseProgress(courseId: string, enabled = true) {
  return useQuery({
    queryKey: learnerCourseProgressQueryKey(courseId),
    queryFn: () => learnerProgressApi.getCourseProgress(courseId),
    enabled: enabled && Boolean(courseId),
    staleTime: 60 * 1000,
  });
}

export function useCompleteLesson(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: learnerProgressApi.completeLesson,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: learnerCourseProgressQueryKey(courseId),
      });

      queryClient.invalidateQueries({
        queryKey: LEARNER_ALL_COURSE_PROGRESS_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: LEARNER_DASHBOARD_ACTIVITY_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: LEARNER_DASHBOARD_STREAK_QUERY_KEY,
      });
    },
  });
}

export function useLearnerAllCourseProgress() {
  return useQuery({
    queryKey: LEARNER_ALL_COURSE_PROGRESS_QUERY_KEY,
    queryFn: learnerProgressApi.getAllCourseProgress,
    staleTime: 60 * 1000,
  });
}

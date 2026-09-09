"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { learnerProgressApi } from "@/Services/progress.service";

export const learnerCourseProgressQueryKey = (courseId: string) =>
  ["learner", "progress", courseId] as const;

export function useLearnerCourseProgress(courseId: string) {
  return useQuery({
    queryKey: learnerCourseProgressQueryKey(courseId),

    queryFn: () => learnerProgressApi.getCourseProgress(courseId),

    enabled: Boolean(courseId),

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
    },
  });
}

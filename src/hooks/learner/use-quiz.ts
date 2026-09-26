"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  learnerQuizApi,
  type SubmitModuleQuizData,
} from "@/Services/learner-quiz.service";

import { learnerCourseProgressQueryKey } from "@/hooks/learner/use-progress";

export const learnerModuleQuizQueryKey = (courseId: string, moduleId: string) =>
  ["learner", "module-quiz", courseId, moduleId] as const;

export function useLearnerModuleQuiz(courseId: string, moduleId: string) {
  return useQuery({
    queryKey: learnerModuleQuizQueryKey(courseId, moduleId),
    queryFn: () => learnerQuizApi.getModuleQuiz(courseId, moduleId),
    enabled: Boolean(courseId) && Boolean(moduleId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubmitModuleQuiz(courseId: string, moduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitModuleQuizData) =>
      learnerQuizApi.submitModuleQuiz(courseId, moduleId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: learnerCourseProgressQueryKey(courseId),
      });

      queryClient.invalidateQueries({
        queryKey: learnerModuleQuizQueryKey(courseId, moduleId),
      });
    },
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  learnerQuizApi,
  type SubmitModuleQuizData,
  type SubmitFinalQuizData,
} from "@/Services/learner-quiz.service";

import {
  LEARNER_ALL_COURSE_PROGRESS_QUERY_KEY,
  learnerCourseProgressQueryKey,
} from "@/hooks/learner/use-progress";

import {
  LEARNER_DASHBOARD_ACTIVITY_QUERY_KEY,
  LEARNER_DASHBOARD_STREAK_QUERY_KEY,
} from "@/hooks/learner/use-dashboard";

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

      queryClient.invalidateQueries({
        queryKey: LEARNER_DASHBOARD_ACTIVITY_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: LEARNER_DASHBOARD_STREAK_QUERY_KEY,
      });
    },
  });
}

/* Final Quiz */

export const learnerFinalQuizQueryKey = (courseId: string) =>
  ["learner", "final-quiz", courseId] as const;

export function useLearnerFinalQuiz(courseId: string) {
  return useQuery({
    queryKey: learnerFinalQuizQueryKey(courseId),

    queryFn: () => learnerQuizApi.getFinalQuiz(courseId),

    enabled: Boolean(courseId),

    staleTime: 5 * 60 * 1000,
  });
}

export function useSubmitFinalQuiz(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitFinalQuizData) =>
      learnerQuizApi.submitFinalQuiz(courseId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: learnerCourseProgressQueryKey(courseId),
      });

      queryClient.invalidateQueries({
        queryKey: learnerFinalQuizQueryKey(courseId),
      });

      queryClient.invalidateQueries({
        queryKey: LEARNER_DASHBOARD_ACTIVITY_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: LEARNER_ALL_COURSE_PROGRESS_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: LEARNER_DASHBOARD_STREAK_QUERY_KEY,
      });
    },
  });
}

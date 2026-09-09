"use client";

import { useQuery } from "@tanstack/react-query";

import { learnerLessonApi } from "@/Services/learner-lesson.service";

export const learnerLessonQueryKey = (lessonId: string) =>
  ["learner", "lesson", lessonId] as const;

export function useLearnerLesson(lessonId: string) {
  return useQuery({
    queryKey: learnerLessonQueryKey(lessonId),

    queryFn: () => learnerLessonApi.getLesson(lessonId),

    enabled: Boolean(lessonId),

    staleTime: 5 * 60 * 1000,
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";

import { learnerCourseApi } from "@/Services/learner-course.service";

export const learnerCourseQueryKey = (courseId: string) =>
  ["learner", "course", courseId] as const;

export const learnerCoursesQueryKey = [
  "learner",
  "courses",
] as const;

/** `enabled: false` skips the request (e.g. the learner isn't enrolled). */
export function useLearnerCourse(courseId: string, enabled = true) {
  return useQuery({
    queryKey: learnerCourseQueryKey(courseId),
    queryFn: () => learnerCourseApi.getCourse(courseId),
    enabled: enabled && Boolean(courseId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLearnerCourses() {
  return useQuery({
    queryKey: learnerCoursesQueryKey,
    queryFn: learnerCourseApi.getCourses,
    staleTime: 5 * 60 * 1000,
  });
}

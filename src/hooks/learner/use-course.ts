"use client";

import { useQuery } from "@tanstack/react-query";

import { learnerCourseApi } from "@/Services/learner-course.service";

export const learnerCourseQueryKey = (courseId: string) =>
  ["learner", "course", courseId] as const;

export const learnerCoursesQueryKey = [
  "learner",
  "courses",
] as const;

export function useLearnerCourse(courseId: string) {
  return useQuery({
    queryKey: learnerCourseQueryKey(courseId),
    queryFn: () => learnerCourseApi.getCourse(courseId),
    enabled: Boolean(courseId),
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

"use client";

import { useQuery } from "@tanstack/react-query";

import {
  publicCourseApi,
  type PublicCourse,
  type PublicCourseDetail,
} from "@/Services/public-course.service";

export const PUBLIC_COURSES_QUERY_KEY = ["public", "courses"] as const;

export const publicCourseQueryKey = (courseId: string) =>
  [...PUBLIC_COURSES_QUERY_KEY, courseId] as const;

export function usePublicCourses() {
  return useQuery<PublicCourse[]>({
    queryKey: PUBLIC_COURSES_QUERY_KEY,
    queryFn: publicCourseApi.getCourses,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicCourse(courseId: string) {
  return useQuery<PublicCourseDetail>({
    queryKey: publicCourseQueryKey(courseId),
    queryFn: () => publicCourseApi.getCourse(courseId),
    enabled: Boolean(courseId),
    staleTime: 5 * 60 * 1000,
  });
}

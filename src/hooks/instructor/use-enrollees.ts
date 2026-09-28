"use client";

import { instructorEnrollmentApi } from "@/Services/enrollment.service";
import { useQuery } from "@tanstack/react-query";

export const INSTRUCTOR_COURSE_ENROLLEES_QUERY_KEY = [
  "instructor",
  "course-enrollees",
] as const;

export function useInstructorCourseEnrollees(courseId: string) {
  return useQuery({
    queryKey: [...INSTRUCTOR_COURSE_ENROLLEES_QUERY_KEY, courseId],
    queryFn: () => instructorEnrollmentApi.getCourseEnrollees(courseId),
    enabled: Boolean(courseId),
  });
}

export function useInstructorCourseEnrollee(
  courseId: string,
  learnerId: string,
) {
  return useQuery({
    queryKey: [...INSTRUCTOR_COURSE_ENROLLEES_QUERY_KEY, courseId, learnerId],
    queryFn: () =>
      instructorEnrollmentApi.getCourseEnrollee(courseId, learnerId),
    enabled: Boolean(courseId && learnerId),
  });
}

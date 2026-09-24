"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { learnerCoursesQueryKey } from "@/hooks/learner/use-course";
import {
  PUBLIC_COURSES_QUERY_KEY,
  publicCourseQueryKey,
} from "@/hooks/use-public-courses";
import {
  ADMIN_COURSES_QUERY_KEY,
  ADMIN_DASHBOARD_QUERY_KEY,
  adminCourseQueryKey,
} from "@/hooks/admin/admin-query-keys";
import { adminApi } from "@/Services/admin.service";

export function useAdminCourses() {
  return useQuery({
    queryKey: ADMIN_COURSES_QUERY_KEY,
    queryFn: adminApi.getCourses,
  });
}

export function useAdminCourse(courseId: string) {
  return useQuery({
    queryKey: adminCourseQueryKey(courseId),
    queryFn: () => adminApi.getCourse(courseId),
    enabled: Boolean(courseId),
  });
}

/**
 * Moderation changes affect the admin views and what learners can browse.
 */
function useInvalidateCourseQueries() {
  const queryClient = useQueryClient();

  return (courseId: string) => {
    queryClient.invalidateQueries({ queryKey: ADMIN_COURSES_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: PUBLIC_COURSES_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: publicCourseQueryKey(courseId) });
    queryClient.invalidateQueries({ queryKey: learnerCoursesQueryKey });
  };
}

export function useFlagCourse() {
  const invalidate = useInvalidateCourseQueries();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.flagCourse(id, reason),
    onSuccess: (_, { id }) => invalidate(id),
  });
}

export function useRemoveCourse() {
  const invalidate = useInvalidateCourseQueries();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.removeCourse(id, reason),
    onSuccess: (_, { id }) => invalidate(id),
  });
}

export function useRestoreCourse() {
  const invalidate = useInvalidateCourseQueries();

  return useMutation({
    mutationFn: (courseId: string) => adminApi.restoreCourse(courseId),
    onSuccess: (_, courseId) => invalidate(courseId),
  });
}

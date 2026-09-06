"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  instructorApi,
  type CreateCourseInput,
  type UpdateCourseInput,
} from "@/Services/course.service";

export const INSTRUCTOR_COURSES_QUERY_KEY = [
  "instructor",
  "courses",
] as const;

export const instructorCourseQueryKey = (
  courseId: string,
) =>
  [
    ...INSTRUCTOR_COURSES_QUERY_KEY,
    courseId,
  ] as const;

/**
 * Get all courses belonging to the current instructor.
 */
export function useInstructorCourses() {
  return useQuery({
    queryKey: INSTRUCTOR_COURSES_QUERY_KEY,
    queryFn: instructorApi.getCourses,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get a single instructor course.
 */
export function useInstructorCourse(
  courseId: string,
) {
  return useQuery({
    queryKey: instructorCourseQueryKey(courseId),
    queryFn: () =>
      instructorApi.getCourse(courseId),
    enabled: Boolean(courseId),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create a course.
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      input: CreateCourseInput,
    ) => instructorApi.createCourse(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: INSTRUCTOR_COURSES_QUERY_KEY,
      });
    },
  });
}

/**
 * Update a course.
 */
export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: string;
      data: UpdateCourseInput;
    }) =>
      instructorApi.updateCourse(
        courseId,
        data,
      ),

    onSuccess: (course) => {
      queryClient.setQueryData(
        instructorCourseQueryKey(course.id),
        course,
      );

      queryClient.invalidateQueries({
        queryKey: INSTRUCTOR_COURSES_QUERY_KEY,
      });
    },
  });
}

/**
 * Delete a course.
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) =>
      instructorApi.deleteCourse(courseId),

    onSuccess: (_, courseId) => {
      queryClient.removeQueries({
        queryKey:
          instructorCourseQueryKey(courseId),
      });

      queryClient.invalidateQueries({
        queryKey: INSTRUCTOR_COURSES_QUERY_KEY,
      });
    },
  });
}

/**
 * Publish a course.
 */
export function usePublishCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) =>
      instructorApi.publishCourse(courseId),

    onSuccess: (course) => {
      queryClient.setQueryData(
        instructorCourseQueryKey(course.id),
        course,
      );

      queryClient.invalidateQueries({
        queryKey: INSTRUCTOR_COURSES_QUERY_KEY,
      });
    },
  });
}

/**
 * Unpublish a course.
 */
export function useUnpublishCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) =>
      instructorApi.unpublishCourse(courseId),

    onSuccess: (course) => {
      queryClient.setQueryData(
        instructorCourseQueryKey(course.id),
        course,
      );

      queryClient.invalidateQueries({
        queryKey: INSTRUCTOR_COURSES_QUERY_KEY,
      });
    },
  });
}
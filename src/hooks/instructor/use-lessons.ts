import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  lessonApi,
  type CreateLessonPayload,
  type UpdateLessonPayload,
} from "@/Services/lesson.service";

/**
 * Get all lessons belonging to a module.
 */
export function useModuleLessons(courseId: string, moduleId: string) {
  return useQuery({
    queryKey: ["module-lessons", courseId, moduleId],
    queryFn: () => lessonApi.getByModule(moduleId, courseId),
    enabled: Boolean(moduleId && courseId),
  });
}

/**
 * Get a single lesson.
 */
export function useLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
) {
  return useQuery({
    queryKey: ["lesson", courseId, moduleId, lessonId],
    queryFn: () => lessonApi.getById(courseId, moduleId, lessonId),
    enabled: Boolean(lessonId && moduleId && courseId),
  });
}

/**
 * Create a lesson.
 */
export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      moduleId,
      data,
      courseId,
    }: {
      moduleId: string;
      data: CreateLessonPayload;
      courseId: string;
    }) => lessonApi.create(moduleId, courseId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["module-lessons", variables.courseId, variables.moduleId],
      });

      queryClient.invalidateQueries({
        queryKey: ["module"],
      });

      queryClient.invalidateQueries({
        queryKey: ["instructor-course"],
      });
    },
  });
}

/**
 * Update a lesson.
 */
export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      data,
      courseId,
      moduleId,
    }: {
      lessonId: string;
      data: UpdateLessonPayload;
      courseId: string;
      moduleId: string;
    }) => lessonApi.update(courseId, moduleId, lessonId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "lesson",
          variables.courseId,
          variables.moduleId,
          variables.lessonId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ["module-lessons"],
      });

      queryClient.invalidateQueries({
        queryKey: ["module"],
      });

      queryClient.invalidateQueries({
        queryKey: ["instructor-course"],
      });
    },
  });
}

/**
 * Delete a lesson.
 */
export function useDeleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      courseId,
      moduleId,
    }: {
      lessonId: string;
      courseId: string;
      moduleId: string;
    }) => lessonApi.delete(courseId, moduleId, lessonId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-lessons"],
      });

      queryClient.invalidateQueries({
        queryKey: ["module"],
      });

      queryClient.invalidateQueries({
        queryKey: ["instructor-course"],
      });
    },
  });
}

/**
 * Delete one lesson attachment (row and R2 object).
 */
export function useDeleteLessonAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      moduleId,
      lessonId,
      attachmentId,
    }: {
      courseId: string;
      moduleId: string;
      lessonId: string;
      attachmentId: string;
    }) => lessonApi.deleteAttachment(courseId, moduleId, lessonId, attachmentId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "lesson",
          variables.courseId,
          variables.moduleId,
          variables.lessonId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ["module-lessons"],
      });

      queryClient.invalidateQueries({
        queryKey: ["module"],
      });

      queryClient.invalidateQueries({
        queryKey: ["instructor-course"],
      });
    },
  });
}

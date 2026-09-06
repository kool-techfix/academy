import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  lessonApi,
  type CreateLessonPayload,
  type UpdateLessonPayload,
} from "@/Services/lesson.service";

/**
 * Get all lessons belonging to a module.
 */
export function useModuleLessons(moduleId: string) {
  return useQuery({
    queryKey: ["module-lessons", moduleId],
    queryFn: () => lessonApi.getByModule(moduleId),
    enabled: Boolean(moduleId),
  });
}

/**
 * Get a single lesson.
 */
export function useLesson(lessonId: string) {
  return useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => lessonApi.getById(lessonId),
    enabled: Boolean(lessonId),
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
    }: {
      moduleId: string;
      data: CreateLessonPayload;
    }) => lessonApi.create(moduleId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["module-lessons", variables.moduleId],
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
    }: {
      lessonId: string;
      data: UpdateLessonPayload;
    }) => lessonApi.update(lessonId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lesson", variables.lessonId],
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
    mutationFn: (lessonId: string) =>
      lessonApi.delete(lessonId),

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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  moduleApi,
  type CreateModulePayload,
  type UpdateModulePayload,
} from "@/Services/module.service";

export function useCourseModules(courseId: string) {
  return useQuery({
    queryKey: ["course-modules", courseId],

    queryFn: () => moduleApi.getByCourse(courseId),

    enabled: Boolean(courseId),
  });
}

export function useModule(moduleId: string) {
  return useQuery({
    queryKey: ["module", moduleId],

    queryFn: () => moduleApi.getById(moduleId),

    enabled: Boolean(moduleId),
  });
}

export function useCreateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: string;
      data: CreateModulePayload;
    }) => moduleApi.create(courseId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["course-modules", variables.courseId],
      });

      // Important because your course detail query
      // may include modules.
      queryClient.invalidateQueries({
        queryKey: ["instructor-course", variables.courseId],
      });
    },
  });
}

export function useUpdateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      moduleId,
      data,
    }: {
      moduleId: string;
      data: UpdateModulePayload;
    }) => moduleApi.update(moduleId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["module", variables.moduleId],
      });

      // We will invalidate related course/module
      // data more specifically once we connect the UI.
      queryClient.invalidateQueries({
        queryKey: ["course-modules"],
      });

      queryClient.invalidateQueries({
        queryKey: ["instructor-course"],
      });
    },
  });
}

export function useDeleteModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) => moduleApi.delete(moduleId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["course-modules"],
      });

      queryClient.invalidateQueries({
        queryKey: ["instructor-course"],
      });
    },
  });
}

import { instructorApi } from "@/lib/api/instructorApi";

export interface CreateModulePayload {
  title: string;
}

export interface UpdateModulePayload {
  title?: string;
  order?: number;
}

export const moduleApi = {
  getByCourse: async (courseId: string) => {
    const response = await instructorApi.get(
      `/courses/${courseId}/modules`,
    );

    return response.data;
  },

  getById: async (moduleId: string) => {
    const response = await instructorApi.get(
      `/modules/${moduleId}`,
    );

    return response.data;
  },

  create: async (
    courseId: string,
    data: CreateModulePayload,
  ) => {
    const response = await instructorApi.post(
      `/courses/${courseId}/modules`,
      data,
    );

    return response.data;
  },

  update: async (
    moduleId: string,
    data: UpdateModulePayload,
  ) => {
    const response = await instructorApi.patch(
      `/modules/${moduleId}`,
      data,
    );

    return response.data;
  },

  delete: async (moduleId: string) => {
    const response = await instructorApi.delete(
      `/modules/${moduleId}`,
    );

    return response.data;
  },
};
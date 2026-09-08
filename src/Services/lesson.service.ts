import { api } from "@/lib/api/axios";

export type Lesson = {
  id: string;
  moduleId: string;
  title: string;
  youtubeVideoLink: string;
  notesFileUrl?: string | null;
  order: number;
};

export type CreateLessonPayload = {
  title: string;
  youtubeVideoLink: string;
  notesFileUrl?: string | null;
  order?: number;
};

export type UpdateLessonPayload = {
  title?: string;
  youtubeVideoLink?: string;
  notesFileUrl?: string | null;
  order?: number;
};

type LessonResponse = {
  data: Lesson;
};

type LessonsResponse = {
  data: Lesson[];
};

export const lessonApi = {
  async getByModule(moduleId: string, courseId: string): Promise<Lesson[]> {
    const response = await api.get<LessonsResponse>(
      `/instructor/courses/${courseId}/modules/${moduleId}/lessons`,
    );

    return response.data.data;
  },

  async getById(
    courseId: string,
    moduleId: string,
    lessonId: string,
  ): Promise<Lesson> {
    const response = await api.get<LessonResponse>(
      `/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
    );

    return response.data.data;
  },

  async create(
    moduleId: string,
    courseId: string,
    data: CreateLessonPayload,
  ): Promise<Lesson> {
    const response = await api.post<LessonResponse>(
      `/instructor/courses/${courseId}/modules/${moduleId}/lessons`,
      data,
    );

    return response.data.data;
  },

  async update(
    courseId: string,
    moduleId: string,
    lessonId: string,
    data: UpdateLessonPayload,
  ): Promise<Lesson> {
    const response = await api.patch<LessonResponse>(
      `/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
      data,
    );

    return response.data.data;
  },

  async delete(
    courseId: string,
    moduleId: string,
    lessonId: string,
  ): Promise<void> {
    await api.delete(
      `/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
    );
  },
};

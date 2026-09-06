import { api } from "@/lib/api/axios";

export type Lesson = {
  id: string;
  moduleId: string;
  title: string;
  youtubeVideoId: string;
  notesFileUrl?: string | null;
  order: number;
};

export type CreateLessonPayload = {
  title: string;
  youtubeVideoId: string;
  notesFileUrl?: string | null;
  order?: number;
};

export type UpdateLessonPayload = {
  title?: string;
  youtubeVideoId?: string;
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
  async getByModule(moduleId: string): Promise<Lesson[]> {
    const response = await api.get<LessonsResponse>(
      `/instructor/modules/${moduleId}/lessons`,
    );

    return response.data.data;
  },

  async getById(lessonId: string): Promise<Lesson> {
    const response = await api.get<LessonResponse>(
      `/instructor/lessons/${lessonId}`,
    );

    return response.data.data;
  },

  async create(
    moduleId: string,
    data: CreateLessonPayload,
  ): Promise<Lesson> {
    const response = await api.post<LessonResponse>(
      `/instructor/modules/${moduleId}/lessons`,
      data,
    );

    return response.data.data;
  },

  async update(
    lessonId: string,
    data: UpdateLessonPayload,
  ): Promise<Lesson> {
    const response = await api.patch<LessonResponse>(
      `/instructor/lessons/${lessonId}`,
      data,
    );

    return response.data.data;
  },

  async delete(lessonId: string): Promise<void> {
    await api.delete(`/instructor/lessons/${lessonId}`);
  },
};
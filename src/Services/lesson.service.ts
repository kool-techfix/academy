import { api } from "@/lib/api/axios";
import { instructorApi } from "@/lib/api/instructorApi";
import type { AttachmentMimeType } from "@/lib/storage/constants";

/** An attachment as returned by the API (no storage key). */
export type LessonAttachment = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

/** A file already uploaded to R2, ready to be attached on save. */
export type LessonAttachmentInput = {
  key: string;
  originalName: string;
  mimeType: AttachmentMimeType;
  size: number;
};

export type Lesson = {
  id: string;
  moduleId: string;
  title: string;
  youtubeVideoLink: string;
  notesFileUrl?: string | null;
  order: number;
  attachments: LessonAttachment[];
};

export type CreateLessonPayload = {
  title: string;
  youtubeVideoLink: string;
  notesFileUrl?: string | null;
  order?: number;
  attachments?: LessonAttachmentInput[];
};

export type UpdateLessonPayload = {
  title?: string;
  youtubeVideoLink?: string;
  notesFileUrl?: string | null;
  order?: number;
  attachments?: LessonAttachmentInput[];
};

export type AttachmentUploadUrlRequest = {
  filename: string;
  contentType: AttachmentMimeType;
  size: number;
  lessonId?: string;
};

export type AttachmentUploadUrl = {
  uploadUrl: string;
  key: string;
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

  /** Presigned R2 PUT URL for one attachment (the bytes go to R2, not us). */
  async createAttachmentUploadUrl(
    courseId: string,
    data: AttachmentUploadUrlRequest,
  ): Promise<AttachmentUploadUrl> {
    const response = await instructorApi.post(
      `/courses/${courseId}/lessons/upload-url`,
      data,
    );

    return (response.data as { data: AttachmentUploadUrl }).data;
  },

  async deleteAttachment(
    courseId: string,
    moduleId: string,
    lessonId: string,
    attachmentId: string,
  ): Promise<void> {
    await instructorApi.delete(
      `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/attachments/${attachmentId}`,
    );
  },
};

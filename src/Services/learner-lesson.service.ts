import { api } from "@/lib/api/axios";
import { learnerApi } from "@/lib/api/learnerApi";

export type LearnerLessonAttachment = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
};

export type LearnerLessonModule = {
  id: string;
  title: string;
  order: number;
  courseId: string;
};

export type LearnerLessonCourse = {
  id: string;
  title: string;
  status: string;
};

export type LearnerLesson = {
  id: string;
  title: string;
  youtubeVideoLink: string;
  notesFileUrl: string | null;
  /** Written lecture note shown under the video. */
  notes: string | null;
  order: number;
  attachments: LearnerLessonAttachment[];
  module: LearnerLessonModule & {
    course: LearnerLessonCourse;
  };
};

type LearnerLessonResponse = {
  data: LearnerLesson;
};

export const learnerLessonApi = {
  async getLesson(
    lessonId: string,
  ): Promise<LearnerLesson> {
    const response =
      await api.get<LearnerLessonResponse>(
        `/learner/lessons/${lessonId}`,
      );

    return response.data.data;
  },

  /** Short-lived signed URL for downloading one attachment. */
  async getAttachmentDownloadUrl(attachmentId: string): Promise<string> {
    const response = await learnerApi.get(
      `/attachments/${attachmentId}/download`,
    );

    return (response.data as { data: { url: string } }).data.url;
  },
};
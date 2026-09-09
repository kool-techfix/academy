import { api } from "@/lib/api/axios";

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
  order: number;
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
};
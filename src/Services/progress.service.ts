import { api } from "@/lib/api/axios";

export type LearnerCourseProgress = {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  percentage: number;
  completedLessonIds: string[];
  lastActivityAt: string | null;
};

type CourseProgressResponse = {
  data: LearnerCourseProgress;
};

type CompleteLessonResponse = {
  data: {
    id: string;
    userId: string;
    lessonId: string;
    completedAt: string;
  };
  message: string;
};

export const learnerProgressApi = {
  async getCourseProgress(
    courseId: string,
  ): Promise<LearnerCourseProgress> {
    const response =
      await api.get<CourseProgressResponse>(
        `/learner/progress/${courseId}`,
      );

    return response.data.data;
  },

  async completeLesson(
    lessonId: string,
  ) {
    const response =
      await api.post<CompleteLessonResponse>(
        `/learner/lessons/${lessonId}/complete`,
      );

    return response.data.data;
  },
};
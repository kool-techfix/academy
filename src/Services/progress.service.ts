import { api } from "@/lib/api/axios";

export type LearnerFinalQuizProgress = {
  attempted: boolean;
  passed: boolean;
  lastAttemptAt: string | null;
};

export type LearnerCourseProgress = {
  courseId: string;

  totalModules: number;
  completedModules: number;
  percentage: number;

  completedModuleIds: string[];

  finalQuiz: LearnerFinalQuizProgress;

  completed: boolean;
  certificateEligible: boolean;

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

type AllCourseProgressResponse = {
  data: LearnerCourseProgress[];
};

export const learnerProgressApi = {
  async getCourseProgress(courseId: string): Promise<LearnerCourseProgress> {
    const response = await api.get<CourseProgressResponse>(
      `/learner/progress/${courseId}`,
    );

    return response.data.data;
  },

  async completeLesson(lessonId: string) {
    const response = await api.post<CompleteLessonResponse>(
      `/learner/lessons/${lessonId}/complete`,
    );

    return response.data.data;
  },

  

  async getAllCourseProgress(): Promise<LearnerCourseProgress[]> {
    const response =
      await api.get<AllCourseProgressResponse>("/learner/progress");

    return response.data.data;
  },
};

import { api } from "@/lib/api/axios";

export type LearnerEnrollmentModule = {
  id: string;
  title: string;
  order: number;
  _count: {
    lessons: number;
  };
};

export type LearnerEnrollmentAuthor = {
  id: string;
  name: string | null;
};

export type LearnerEnrollmentCourse = {
  id: string;
  title: string;
  description: string;
  status: string;
  modules: LearnerEnrollmentModule[];
  authors: LearnerEnrollmentAuthor[];
};

export type LearnerEnrollment = {
  id: string;
  userId: string;
  courseId: string;
  status: string;
  enrolledAt: string;
  completedAt: string | null;
  course: LearnerEnrollmentCourse;
};

type LearnerEnrollmentsResponse = {
  data: LearnerEnrollment[];
};

type CreateEnrollmentResponse = {
  data: LearnerEnrollment;
  message: string;
};

export const learnerEnrollmentApi = {
  async getEnrollments(): Promise<LearnerEnrollment[]> {
    const response =
      await api.get<LearnerEnrollmentsResponse>(
        "/learner/enrollments",
      );

    return response.data.data;
  },

  async enroll(
    courseId: string,
  ): Promise<LearnerEnrollment> {
    const response =
      await api.post<CreateEnrollmentResponse>(
        "/learner/enrollments",
        {
          courseId,
        },
      );

    return response.data.data;
  },
};
import { api } from "@/lib/api/axios";
import { instructorApi } from "@/lib/api/instructorApi";

export interface InstructorEnrollee {
  id: string;
  name: string;
  progress: number;
  finalAssessmentResult: number | "In progress";
}
export interface InstructorCourseEnrollees {
  course: { id: string; title: string };
  enrollees: InstructorEnrollee[];
}

export interface InstructorModuleResult {
  moduleId: string;
  moduleOrder: number;
  moduleTitle: string;
  score: number;
  total: number;
  passed: boolean;
  hasAttempt: boolean;
}

export interface InstructorCourseEnrollee {
  course: { id: string; title: string };
  learner: { id: string; name: string; email: string };
  progress: number;
  moduleResults: InstructorModuleResult[];
  finalAssessmentResult: number | "In progress";
}

export type LearnerEnrollmentModule = {
  id: string;
  title: string;
  order: number;
  quiz: {
    id: string;
  } | null;
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
    const response = await api.get<LearnerEnrollmentsResponse>(
      "/learner/enrollments",
    );

    return response.data.data;
  },

  async enroll(courseId: string): Promise<LearnerEnrollment> {
    const response = await api.post<CreateEnrollmentResponse>(
      "/learner/enrollments",
      {
        courseId,
      },
    );

    return response.data.data;
  },
};

export const instructorEnrollmentApi = {
  async getCourseEnrollees(
    courseId: string,
  ): Promise<InstructorCourseEnrollees> {
    const response = await instructorApi.get(`/courses/${courseId}/enrollees`);
    return response.data.data;
  },
  async getCourseEnrollee(
    courseId: string,
    learnerId: string,
  ): Promise<InstructorCourseEnrollee> {
    const response = await instructorApi.get(
      `/courses/${courseId}/enrollees/${learnerId}`,
    );
    return response.data.data;
  },
};

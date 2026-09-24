import { api } from "@/lib/api/axios";

import type { CourseStatus } from "@/Services/course.service";
import type { InstructorStatus } from "@/Services/auth.service";

export type AccountStatus = "ACTIVE" | "SUSPENDED" | "REMOVED";

export type CourseModerationStatus = "NONE" | "FLAGGED" | "REMOVED";

export type ModeratedRole = "LEARNER" | "INSTRUCTOR";

export type AdminUserStatus = InstructorStatus | AccountStatus;

export type AdminDashboardCounts = {
  pendingInstructors: number;
  publishedCourses: number;
  flaggedCourses: number;
  learners: number;
};

export type AdminInstructor = {
  id: string;
  name: string;
  email: string;
  role: "INSTRUCTOR";
  expertise: string | null;
  instructorStatus: InstructorStatus | null;
  accountStatus: AccountStatus;
  moderationReason: string | null;
  moderatedAt: string | null;
  createdAt: string;
};

export type AdminUser = Omit<AdminInstructor, "role"> & {
  role: ModeratedRole;
  status: AdminUserStatus;
};

type CourseInstructor = {
  id: string;
  name: string;
  email: string;
};

export type AdminCourse = {
  id: string;
  title: string;
  description: string;
  status: CourseStatus;
  moderationStatus: CourseModerationStatus;
  moderationReason: string | null;
  moderatedAt: string | null;
  createdAt: string;
  instructors: CourseInstructor[];
  _count: {
    modules: number;
    enrollments: number;
  };
};

export type AdminQuizQuestion = {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
};

export type AdminQuiz = {
  id: string;
  passScore: number;
  allowRetake: boolean;
  questions: AdminQuizQuestion[];
};

export type AdminCourseReview = Omit<AdminCourse, "_count"> & {
  modules: {
    id: string;
    title: string;
    order: number;
    lessons: {
      id: string;
      title: string;
      order: number;
      youtubeVideoLink: string;
      notesFileUrl: string | null;
    }[];
    quiz: AdminQuiz | null;
  }[];
  finalQuiz: AdminQuiz | null;
  _count: {
    enrollments: number;
  };
};

export type InstructorDecisionResult = {
  data: AdminInstructor;
  emailSent: boolean;
};

type DataResponse<T> = {
  data: T;
};

export const adminApi = {
  async getDashboard(): Promise<AdminDashboardCounts> {
    const response =
      await api.get<DataResponse<AdminDashboardCounts>>("/admin/dashboard");

    return response.data.data;
  },

  async getInstructors(status?: InstructorStatus): Promise<AdminInstructor[]> {
    const response = await api.get<DataResponse<AdminInstructor[]>>(
      "/admin/instructors",
      { params: status ? { status } : {} },
    );

    return response.data.data;
  },

  async approveInstructor(id: string): Promise<InstructorDecisionResult> {
    const response = await api.patch<InstructorDecisionResult>(
      `/admin/instructors/${id}/approve`,
    );

    return response.data;
  },

  async rejectInstructor(
    id: string,
    reason: string,
  ): Promise<InstructorDecisionResult> {
    const response = await api.patch<InstructorDecisionResult>(
      `/admin/instructors/${id}/reject`,
      { reason },
    );

    return response.data;
  },

  async getCourses(): Promise<AdminCourse[]> {
    const response =
      await api.get<DataResponse<AdminCourse[]>>("/admin/courses");

    return response.data.data;
  },

  async getCourse(id: string): Promise<AdminCourseReview> {
    const response = await api.get<DataResponse<AdminCourseReview>>(
      `/admin/courses/${id}`,
    );

    return response.data.data;
  },

  async flagCourse(id: string, reason: string): Promise<void> {
    await api.patch(`/admin/courses/${id}/flag`, { reason });
  },

  async removeCourse(id: string, reason: string): Promise<void> {
    await api.patch(`/admin/courses/${id}/remove`, { reason });
  },

  async restoreCourse(id: string): Promise<void> {
    await api.patch(`/admin/courses/${id}/restore`);
  },

  async getUsers(role?: ModeratedRole): Promise<AdminUser[]> {
    const response = await api.get<DataResponse<AdminUser[]>>("/admin/users", {
      params: role ? { role } : {},
    });

    return response.data.data;
  },

  async suspendUser(id: string, reason: string): Promise<AdminUser> {
    const response = await api.patch<DataResponse<AdminUser>>(
      `/admin/users/${id}/suspend`,
      { reason },
    );

    return response.data.data;
  },

  async removeUser(id: string, reason: string): Promise<AdminUser> {
    const response = await api.patch<DataResponse<AdminUser>>(
      `/admin/users/${id}/remove`,
      { reason },
    );

    return response.data.data;
  },

  async reinstateUser(id: string): Promise<AdminUser> {
    const response = await api.patch<DataResponse<AdminUser>>(
      `/admin/users/${id}/reinstate`,
    );

    return response.data.data;
  },
};

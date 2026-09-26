import { api } from "@/lib/api/axios";

export type LearnerCourseAuthor = {
  id: string;
  name: string | null;
};

export type LearnerCourseLesson = {
  id: string;
  title: string;
  order: number;
};

export type LearnerCourseQuiz = {
  id: string;
};

export type LearnerCourseModule = {
  id: string;
  title: string;
  order: number;
  lessons: LearnerCourseLesson[];
  quiz: LearnerCourseQuiz | null;
};

export type LearnerCourse = {
  id: string;
  title: string;
  description: string;
  status: string;
  authors: LearnerCourseAuthor[];
  modules: LearnerCourseModule[];
  _count: {
    enrollments: number;
  };
};

type LearnerCourseResponse = {
  data: LearnerCourse;
};

export type LearnerCatalogModule = {
  id: string;
  title: string;
  order: number;
};

export type LearnerCatalogCourse = {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  authors: LearnerCourseAuthor[];
  modules: LearnerCatalogModule[];
  _count: {
    enrollments: number;
  };
};

type LearnerCatalogCoursesResponse = {
  data: LearnerCatalogCourse[];
};

export const learnerCourseApi = {
  async getCourse(courseId: string): Promise<LearnerCourse> {
    const response = await api.get<LearnerCourseResponse>(
      `/learner/courses/${courseId}`,
    );

    return response.data.data;
  },

  async getCourses(): Promise<LearnerCatalogCourse[]> {
    const response =
      await api.get<LearnerCatalogCoursesResponse>("/learner/courses");

    return response.data.data;
  },
};

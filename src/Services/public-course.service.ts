import { api } from "@/lib/api/axios";

export type PublicCourseAuthor = {
  id: string;
  name: string | null;
};

export type PublicCourseModule = {
  id: string;
  title: string;
  order: number;
};

export type PublicCourse = {
  id: string;
  title: string;
  description: string;
  authors: PublicCourseAuthor[];
  modules: PublicCourseModule[];
  _count: {
    enrollments: number;
  };
};

export type PublicLesson = {
  id: string;
  title: string;
  order: number;
};

export type PublicQuiz = {
  id: string;
};

export type PublicCourseDetailModule = {
  id: string;
  title: string;
  order: number;
  lessons: PublicLesson[];
  quiz: PublicQuiz | null;
};

export type PublicCourseDetail = Omit<
  PublicCourse,
  "modules"
> & {
  modules: PublicCourseDetailModule[];
};

type PublicCoursesResponse = {
  data: PublicCourse[];
};

type PublicCourseResponse = {
  data: PublicCourseDetail;
};

export const publicCourseApi = {
  async getCourses(): Promise<PublicCourse[]> {
    const response = await api.get<PublicCoursesResponse>(
      "/courses",
    );

    return response.data.data;
  },

  async getCourse(courseId: string): Promise<PublicCourseDetail> {
    const response = await api.get<PublicCourseResponse>(
      `/courses/${courseId}`,
    );

    return response.data.data;
  },
};
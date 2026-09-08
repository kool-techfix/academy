import { api } from "@/lib/api/axios";

export type CourseStatus = "DRAFT" | "PUBLISHED";

export type CourseAuthor = {
  id: string;
  userId: string;
  role: string;

  user: {
    id: string;
    name: string;
    email: string;
  };
};

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  id: string;
  moduleId?: string | null;
  courseId?: string | null;

  passScore: number;
  allowRetake: boolean;

  questions: QuizQuestion[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  youtubeVideoLink: string;
  notesFileUrl?: string | null;
  order: number;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  order: number;

  lessons: Lesson[];
  quiz?: Quiz | null;
}

export type CourseModule = {
  id: string;
  title: string;
  order: number;
};

export type InstructorCourse = {
  id: string;
  title: string;
  description: string;
  status: CourseStatus;
  createdAt: string;

  authors: CourseAuthor[];

  modules: CourseModule[];

  _count?: {
    enrollments: number;
  };
};

export type InstructorCourseDetail = Omit<InstructorCourse, "modules"> & {
  modules: Module[];
};

export type CreateCourseInput = {
  title: string;
  description: string;
};

export type UpdateCourseInput = {
  title?: string;
  description?: string;
};

type CourseResponse = {
  data: InstructorCourse;
};

type CourseDetailResponse = {
  data: InstructorCourseDetail;
};

type CoursesResponse = {
  data: InstructorCourse[];
};

export const instructorApi = {
  async getCourses(): Promise<InstructorCourse[]> {
    const response = await api.get<CoursesResponse>("/instructor/courses");

    return response.data.data;
  },

  async getCourse(courseId: string): Promise<InstructorCourseDetail> {
    const response = await api.get<CourseDetailResponse>(
      `/instructor/courses/${courseId}`,
    );

    return response.data.data;
  },

  async createCourse(input: CreateCourseInput): Promise<InstructorCourse> {
    const response = await api.post<CourseResponse>(
      "/instructor/courses",
      input,
    );

    return response.data.data;
  },

  async updateCourse(
    courseId: string,
    input: UpdateCourseInput,
  ): Promise<InstructorCourse> {
    const response = await api.patch<CourseResponse>(
      `/instructor/courses/${courseId}`,
      input,
    );

    return response.data.data;
  },

  async deleteCourse(courseId: string): Promise<void> {
    await api.delete(`/instructor/courses/${courseId}`);
  },

  async publishCourse(courseId: string): Promise<InstructorCourse> {
    const response = await api.patch<CourseResponse>(
      `/instructor/courses/${courseId}/publish`,
    );

    return response.data.data;
  },

  async unpublishCourse(courseId: string): Promise<InstructorCourse> {
    const response = await api.patch<CourseResponse>(
      `/instructor/courses/${courseId}/unpublish`,
    );

    return response.data.data;
  },
};

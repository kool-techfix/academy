import { api } from "@/lib/api/axios";

export type QuizType = "MODULE" | "FINAL";

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

  type: QuizType;

  passScore: number;

  allowRetake: boolean;

  questions: QuizQuestion[];
}

export type CreateQuizPayload = {
  type: QuizType;

  passScore?: number;

  allowRetake?: boolean;

  questions?: CreateQuestionPayload[];
};

export type UpdateQuizPayload = {
  passScore?: number;

  allowRetake?: boolean;
};

export type CreateQuestionPayload = {
  questionText: string;

  options: string[];

  correctAnswer: string;
};

export type UpdateQuestionPayload = {
  questionText?: string;

  options?: string[];

  correctAnswer?: string;
};

type QuizResponse = {
  data: Quiz;
};

type QuestionResponse = {
  data: QuizQuestion;
};

export const quizApi = {
  /**
   * Get the quiz attached to a module
   */
  async getByModule(moduleId: string, courseId: string): Promise<Quiz | null> {
    try {
      const response = await api.get<QuizResponse>(
        `/instructor/courses/${courseId}/modules/${moduleId}/quiz`,
      );

      return response.data.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }

      throw error;
    }
  },

  /**
   * Create a quiz for a module
   */
  async createForModule(
    moduleId: string,
    courseId: string,
    data: CreateQuizPayload,
  ): Promise<Quiz> {
    const response = await api.post<QuizResponse>(
      `/instructor/courses/${courseId}/modules/${moduleId}/quiz`,
      data,
    );

    return response.data.data;
  },

  /**
   * Update quiz settings
   */
  async update(quizId: string, data: UpdateQuizPayload): Promise<Quiz> {
    const response = await api.patch<QuizResponse>(
      `/instructor/quizzes/${quizId}`,
      data,
    );

    return response.data.data;
  },

  /**
   * Delete a quiz
   */
  async delete(quizId: string): Promise<void> {
    await api.delete(`/instructor/quizzes/${quizId}`);
  },

  /**
   * Add a question to a quiz
   */
  async createQuestion(
    quizId: string,
    data: CreateQuestionPayload,
  ): Promise<QuizQuestion> {
    const response = await api.post<QuestionResponse>(
      `/instructor/quizzes/${quizId}/questions`,
      data,
    );

    return response.data.data;
  },

  /**
   * Update a quiz question
   */
  async updateQuestion(
    questionId: string,
    data: UpdateQuestionPayload,
  ): Promise<QuizQuestion> {
    const response = await api.patch<QuestionResponse>(
      `/instructor/questions/${questionId}`,
      data,
    );

    return response.data.data;
  },

  /**
   * Delete a quiz question
   */
  async deleteQuestion(questionId: string): Promise<void> {
    await api.delete(`/instructor/questions/${questionId}`);
  },

  /**
   * Get the final assessment attached to a course
   */
  async getByCourse(courseId: string): Promise<Quiz | null> {
    try {
      const response = await api.get<QuizResponse>(
        `/instructor/courses/${courseId}/final-assessment`,
      );

      return response.data.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }

      throw error;
    }
  },

  /**
   * Create a final assessment for a course
   */
  async createForCourse(
    courseId: string,
    data: CreateQuizPayload,
  ): Promise<Quiz> {
    const response = await api.post<QuizResponse>(
      `/instructor/courses/${courseId}/final-assessment`,
      data,
    );

    return response.data.data;
  },
};

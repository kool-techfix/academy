import { api } from "@/lib/api/axios";

export type LearnerFinalQuizQuestion = {
  id: string;
  questionText: string;
  options: string[];
};

export type LearnerFinalQuiz = {
  id: string;
  courseId: string;
  type: "FINAL";
  passScore: number;
  allowRetake: boolean;
  questions: LearnerFinalQuizQuestion[];
};

export type SubmitFinalQuizData = {
  quizId: string;
  answers: QuizAnswer[];
};

export type QuizAnswer = {
  questionId: string;
  answer: string;
};

export type SubmitFinalQuizResult = {
  attemptId: string;
  quizId: string;
  score: number;
  passed: boolean;
  passScore: number;
};

export type LearnerQuizQuestion = {
  id: string;
  questionText: string;
  options: string[];
};

export type LearnerModuleQuiz = {
  id: string;
  moduleId: string;
  type: "MODULE";
  passScore: number;
  allowRetake: boolean;
  questions: LearnerQuizQuestion[];
};

export type SubmitQuizAnswer = {
  questionId: string;
  answer: string;
};

export type SubmitModuleQuizData = {
  quizId: string;
  answers: SubmitQuizAnswer[];
};

export type SubmitModuleQuizResult = {
  attemptId: string;
  quizId: string;
  score: number;
  passed: boolean;
  passScore: number;
};

type LearnerQuizResponse = {
  data: LearnerModuleQuiz;
};

type SubmitQuizResponse = {
  data: SubmitModuleQuizResult;
  message: string;
};

export const learnerQuizApi = {
  async getModuleQuiz(
    courseId: string,
    moduleId: string,
  ): Promise<LearnerModuleQuiz> {
    const response = await api.get<LearnerQuizResponse>(
      `/learner/courses/${courseId}/modules/${moduleId}/quiz`,
    );

    return response.data.data;
  },

  async submitModuleQuiz(
    courseId: string,
    moduleId: string,
    data: SubmitModuleQuizData,
  ): Promise<SubmitModuleQuizResult> {
    const response = await api.post<SubmitQuizResponse>(
      `/learner/courses/${courseId}/modules/${moduleId}/quiz`,
      data,
    );

    return response.data.data;
  },

  async getFinalQuiz(courseId: string): Promise<LearnerFinalQuiz> {
    const response = await api.get<{
      data: LearnerFinalQuiz;
    }>(`/learner/courses/${courseId}/final-quiz`);

    return response.data.data;
  },

  async submitFinalQuiz(
    courseId: string,
    data: SubmitFinalQuizData,
  ): Promise<SubmitFinalQuizResult> {
    const response = await api.post<{
      data: SubmitFinalQuizResult;
    }>(`/learner/courses/${courseId}/final-quiz`, data);

    return response.data.data;
  },
};

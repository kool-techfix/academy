import { EnrollmentRepository } from "@/Repositories/EnrollmentRepository";
import { LearnerQuizRepository } from "@/Repositories/LearnerQuizRepository";
import { QuizAttemptRepository } from "@/Repositories/QuizAttemptRepository";

export type QuizAnswer = {
  questionId: string;
  answer: string;
};

export type SubmitQuizData = {
  quizId: string;
  answers: QuizAnswer[];
};

export class LearnerQuizService {
  constructor(
    private readonly quizRepository =
      new LearnerQuizRepository(),
    private readonly enrollmentRepository =
      new EnrollmentRepository(),
    private readonly quizAttemptRepository =
      new QuizAttemptRepository(),
  ) {}

  async getModuleQuiz(
    userId: string,
    courseId: string,
    moduleId: string,
  ) {
    const enrollment =
      await this.enrollmentRepository.findByUserAndCourse(
        userId,
        courseId,
      );

    if (!enrollment) {
      throw new Error(
        "You are not enrolled in this course",
      );
    }

    const quiz =
      await this.quizRepository.findModuleQuizForLearner(
        moduleId,
        courseId,
      );

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    return quiz;
  }

  async submitModuleQuiz(
    userId: string,
    courseId: string,
    moduleId: string,
    data: SubmitQuizData,
  ) {
    const enrollment =
      await this.enrollmentRepository.findByUserAndCourse(
        userId,
        courseId,
      );

    if (!enrollment) {
      throw new Error(
        "You are not enrolled in this course",
      );
    }

    if (!data.quizId) {
      throw new Error("Quiz ID is required");
    }

    const quiz =
      await this.quizRepository.findQuizForSubmission(
        data.quizId,
      );

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    if (quiz.type !== "MODULE") {
      throw new Error(
        "This quiz is not a module quiz",
      );
    }

    if (quiz.moduleId !== moduleId) {
      throw new Error(
        "Quiz does not belong to this module",
      );
    }

    if (
      !quiz.module ||
      quiz.module.courseId !== courseId
    ) {
      throw new Error(
        "Quiz does not belong to this course",
      );
    }

    if (quiz.questions.length === 0) {
      throw new Error(
        "Quiz has no questions",
      );
    }

    if (
      data.answers.length !==
      quiz.questions.length
    ) {
      throw new Error(
        "All quiz questions must be answered",
      );
    }

    const questionIds = new Set(
      quiz.questions.map(
        (question) => question.id,
      ),
    );

    const submittedQuestionIds =
      data.answers.map(
        (answer) => answer.questionId,
      );

    const hasInvalidQuestion =
      submittedQuestionIds.some(
        (questionId) =>
          !questionIds.has(questionId),
      );

    if (hasInvalidQuestion) {
      throw new Error(
        "Invalid question submitted",
      );
    }

    const hasDuplicateQuestion =
      new Set(submittedQuestionIds).size !==
      submittedQuestionIds.length;

    if (hasDuplicateQuestion) {
      throw new Error(
        "Duplicate question answers are not allowed",
      );
    }

    const questionMap = new Map(
      quiz.questions.map((question) => [
        question.id,
        question.correctAnswer,
      ]),
    );

    const correctAnswers =
      data.answers.filter(
        (answer) =>
          questionMap.get(answer.questionId) ===
          answer.answer,
      ).length;

    const score = Math.round(
      (correctAnswers /
        quiz.questions.length) *
        100,
    );

    const passed =
      score >= quiz.passScore;

    const attempt =
      await this.quizAttemptRepository.createAttempt(
        userId,
        quiz.id,
        score,
        passed,
      );

    return {
      attemptId: attempt.id,
      quizId: quiz.id,
      score,
      passed,
      passScore: quiz.passScore,
    };
  }
}
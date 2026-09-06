import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export class QuizRepository {
  async create(data: Prisma.QuizCreateInput) {
    return prisma.quiz.create({
      data,
      include: {
        questions: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.quiz.findUnique({
      where: {
        id,
      },
      include: {
        questions: true,
        module: true,
        course: true,
      },
    });
  }

  async findByModule(moduleId: string) {
    return prisma.quiz.findUnique({
      where: {
        moduleId,
      },
      include: {
        questions: true,
      },
    });
  }

  async findByCourse(courseId: string) {
    return prisma.quiz.findUnique({
      where: {
        courseId,
      },
      include: {
        questions: true,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.QuizUpdateInput,
  ) {
    return prisma.quiz.update({
      where: {
        id,
      },
      data,
      include: {
        questions: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.quiz.delete({
      where: {
        id,
      },
    });
  }

  async exists(id: string) {
    const quiz = await prisma.quiz.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    return Boolean(quiz);
  }

  async createQuestion(data: Prisma.QuestionCreateInput) {
    return prisma.question.create({
      data,
    });
  }

  async findQuestionById(id: string) {
    return prisma.question.findUnique({
      where: {
        id,
      },
    });
  }

  async updateQuestion(
    id: string,
    data: Prisma.QuestionUpdateInput,
  ) {
    return prisma.question.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteQuestion(id: string) {
    return prisma.question.delete({
      where: {
        id,
      },
    });
  }

  async deleteQuestionsByQuiz(quizId: string) {
    return prisma.question.deleteMany({
      where: {
        quizId,
      },
    });
  }
}
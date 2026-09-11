import { QuizType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export class LearnerQuizRepository {
  async findModuleQuizForLearner(
    moduleId: string,
    courseId: string,
  ) {
    return prisma.quiz.findFirst({
      where: {
        moduleId,
        type: QuizType.MODULE,
        module: {
          courseId,
        },
      },
      select: {
        id: true,
        moduleId: true,
        type: true,
        passScore: true,
        allowRetake: true,

        questions: {
          select: {
            id: true,
            questionText: true,
            options: true,
          },
          orderBy: {
            id: "asc",
          },
        },
      },
    });
  }

  async findQuizForSubmission(
    quizId: string,
  ) {
    return prisma.quiz.findUnique({
      where: {
        id: quizId,
      },
      select: {
        id: true,
        type: true,
        moduleId: true,
        courseId: true,
        passScore: true,
        allowRetake: true,

        module: {
          select: {
            courseId: true,
          },
        },

        questions: {
          select: {
            id: true,
            correctAnswer: true,
          },
        },
      },
    });
  }
}
import { QuizType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export class QuizAttemptRepository {
  /**
   * Get the IDs of module quizzes that the learner has passed.
   *
   * A module is considered completed when the learner
   * has at least one passing attempt for its quiz.
   */
  async findPassedModuleQuizIds(userId: string, courseId: string) {
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        passed: true,
        quiz: {
          type: QuizType.MODULE,
          module: {
            courseId,
          },
        },
      },
      select: {
        quizId: true,
      },
      distinct: ["quizId"],
    });

    return attempts.map((attempt) => attempt.quizId);
  }

  /**
   * Get the learner's final quiz status.
   *
   * A learner may have multiple attempts.
   */
  async findFinalQuizStatus(userId: string, courseId: string) {
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        quiz: {
          type: QuizType.FINAL,
          courseId,
        },
      },
      select: {
        passed: true,
        attemptedAt: true,
      },
      orderBy: {
        attemptedAt: "desc",
      },
    });

    if (attempts.length === 0) {
      return {
        attempted: false,
        passed: false,
        lastAttemptAt: null,
      };
    }

    return {
      attempted: true,
      passed: attempts.some((attempt) => attempt.passed),
      lastAttemptAt: attempts[0].attemptedAt,
    };
  }
  async createAttempt(
    userId: string,
    quizId: string,
    score: number,
    passed: boolean,
  ) {
    return prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        passed,
      },
    });
  }
  async findCourseProgressData(userId: string) {
    return prisma.quizAttempt.findMany({
      where: {
        userId,
      },
      select: {
        quizId: true,
        passed: true,
        attemptedAt: true,
        quiz: {
          select: {
            type: true,
            moduleId: true,
            courseId: true,
            module: {
              select: {
                courseId: true,
              },
            },
          },
        },
      },
      orderBy: {
        attemptedAt: "desc",
      },
    });
  }

  async findRecentByUser(userId: string, limit = 10) {
  return prisma.quizAttempt.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      score: true,
      passed: true,
      attemptedAt: true,
      quiz: {
        select: {
          id: true,
          type: true,
          module: {
            select: {
              title: true,
              course: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      attemptedAt: "desc",
    },
    take: limit,
  });
}
}

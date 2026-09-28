import { prisma } from "@/lib/prisma";

export class ProgressRepository {
  /**
   * Find a learner's progress for a specific lesson.
   */
  async findByUserAndLesson(userId: string, lessonId: string) {
    return prisma.progress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });
  }

  /**
   * Mark a lesson as completed.
   *
   * Uses upsert so calling this multiple times
   * does not create duplicate progress records.
   */
  async markLessonCompleted(userId: string, lessonId: string) {
    return prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      create: {
        userId,
        lessonId,
      },
      update: {
        completedAt: new Date(),
      },
    });
  }

  /**
   * Get all completed lessons for a learner
   * within a specific course.
   */
  async findByUserAndCourse(userId: string, courseId: string) {
    return prisma.progress.findMany({
      where: {
        userId,
        lesson: {
          module: {
            courseId,
          },
        },
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            order: true,
            moduleId: true,
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
    });
  }

  async findLessonWithCourse(lessonId: string) {
    return prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
      select: {
        id: true,
        module: {
          select: {
            courseId: true,
          },
        },
      },
    });
  }

  async findRecentByUser(userId: string, limit = 10) {
    return prisma.progress.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        completedAt: true,
        lesson: {
          select: {
            id: true,
            title: true,
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
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
      take: limit,
    });
  }

  async findActivityDates(userId: string, since: Date) {
    return prisma.progress.findMany({
      where: {
        userId,
        completedAt: {
          gte: since,
        },
      },
      select: {
        completedAt: true,
      },
      orderBy: {
        completedAt: "desc",
      },
    });
  }
}

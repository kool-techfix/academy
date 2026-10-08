import { prisma } from "@/lib/prisma";

export class EnrollmentRepository {
  /**
   * Create a new course enrollment.
   */
  async create(userId: string, courseId: string) {
    return prisma.enrollment.create({
      data: {
        userId,
        courseId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
          },
        },
      },
    });
  }

  /**
   * Find a learner's enrollment for a specific course.
   */
  /**
   * Clear a learner's attempts (module + final) and lesson progress for a
   * course in one transaction, so they can work through it again.
   */
  async resetCourseProgress(userId: string, courseId: string) {
    const [attempts, lessons] = await prisma.$transaction([
      prisma.quizAttempt.deleteMany({
        where: {
          userId,
          quiz: {
            OR: [{ courseId }, { module: { courseId } }],
          },
        },
      }),
      prisma.progress.deleteMany({
        where: { userId, lesson: { module: { courseId } } },
      }),
    ]);

    return { attempts: attempts.count, lessons: lessons.count };
  }

  async reactivate(id: string) {
    return prisma.enrollment.update({
      where: { id },
      data: { status: "ACTIVE", completedAt: null },
    });
  }

  async countByCourse(courseId: string) {
    return prisma.enrollment.count({ where: { courseId } });
  }

  async findByUserAndCourse(userId: string, courseId: string) {
    return prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });
  }

  /**
   * Get all courses a learner is enrolled in.
   */
  async findByUser(userId: string) {
    return prisma.enrollment.findMany({
      where: {
        userId,
      },
      include: {
        course: {
          include: {
            modules: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                order: true,

                quiz: {
                  select: {
                    id: true,
                  },
                },

                _count: {
                  select: {
                    lessons: true,
                  },
                },
              },
            },

            authors: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });
  }

  /** * Get all learners enrolled in a specific course. * * Used by the instructor enrollee list. * * Includes the learner and the course's modules/quizzes so the * service can calculate module-based course progress. */

  async findCourseEnrollees(courseId: string) {
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
        title: true,
        modules: {
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
            title: true,
            order: true,
            quiz: {
              select: {
                id: true,
              },
            },
          },
        },
        finalQuiz: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!course) {
      return null;
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
      },
      orderBy: {
        enrolledAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            quizAttempts: {
              where: {
                quiz: {
                  OR: [
                    {
                      module: {
                        courseId,
                      },
                    },
                    {
                      courseId,
                    },
                  ],
                },
              },
              select: {
                quizId: true,
                score: true,
                passed: true,
                attemptedAt: true,
              },
              orderBy: {
                attemptedAt: "desc",
              },
            },
          },
        },
      },
    });

    return {
      course,
      enrollments,
    };
  }

  /** * Get a specific learner enrolled in a course. * * Includes the course modules, module quizzes, quiz questions, * and the learner's quiz attempts so the service can build the * instructor's enrollee detail view. */
  async findCourseEnrollee(courseId: string, learnerId: string) {
    return prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: learnerId,
          courseId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            quizAttempts: {
              where: {
                quiz: {
                  OR: [
                    {
                      module: {
                        courseId,
                      },
                    },
                    {
                      courseId,
                    },
                  ],
                },
              },
              select: {
                quizId: true,
                score: true,
                passed: true,
                attemptedAt: true,
              },
              orderBy: {
                attemptedAt: "desc",
              },
            },
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            modules: {
              orderBy: {
                order: "asc",
              },
              select: {
                id: true,
                title: true,
                order: true,
                quiz: {
                  select: {
                    id: true,
                    type: true,
                    questions: {
                      select: {
                        id: true,
                      },
                    },
                  },
                },
              },
            },
            finalQuiz: {
              select: {
                id: true,
                type: true,
                questions: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
  /** * Get a learner's quiz attempts for a specific course. * * This is kept separate from the enrollee lookup so the repository * does not need to load unrelated quiz attempts. */
  async findUserAttemptsForCourse(userId: string, courseId: string) {
    return prisma.quizAttempt.findMany({
      where: { userId, quiz: { OR: [{ module: { courseId } }, { courseId }] } },
      select: {
        id: true,
        quizId: true,
        score: true,
        passed: true,
        attemptedAt: true,
      },
      orderBy: { attemptedAt: "desc" },
    });
  }
}

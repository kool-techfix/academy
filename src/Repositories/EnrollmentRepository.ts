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
}

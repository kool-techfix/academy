import { prisma } from "@/lib/prisma";

import {
  CourseModerationStatus,
  CourseStatus,
  type Prisma,
} from "@/generated/prisma/client";

export class CourseRepository {
  async create(data: Prisma.CourseCreateInput) {
    return prisma.course.create({
      data,
      include: {
        authors: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.course.findUnique({
      where: { id },
      include: {
        authors: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        modules: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });
  }

  async findByInstructor(userId: string) {
    return prisma.course.findMany({
      where: {
        authors: {
          some: {
            userId,
          },
        },
      },
      include: {
        authors: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        modules: {
          orderBy: {
            order: "asc",
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async update(id: string, data: Prisma.CourseUpdateInput) {
    return prisma.course.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.course.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: CourseStatus) {
    return prisma.course.update({
      where: { id },
      data: {
        status,
      },
    });
  }

  async findAuthor(courseId: string, userId: string) {
    return prisma.courseAuthor.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId,
        },
      },
    });
  }

  async isAuthor(courseId: string, userId: string) {
    const author = await prisma.courseAuthor.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId,
        },
      },
    });

    return Boolean(author);
  }

  async getModuleWithCourse(moduleId: string) {
    return prisma.module.findUnique({
      where: {
        id: moduleId,
      },
      select: {
        id: true,
        courseId: true,
      },
    });
  }

  async findQuizCourseId(quizId: string) {
  return prisma.quiz.findUnique({
    where: {
      id: quizId,
    },
    select: {
      module: {
        select: {
          courseId: true,
        },
      },
      courseId: true,
      type: true,
    },
  });
}

  async findPublished() {
    return prisma.course.findMany({
      where: {
        status: CourseStatus.PUBLISHED,
        moderationStatus: {
          not: CourseModerationStatus.REMOVED,
        },
      },

      include: {
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

        modules: {
          select: {
            id: true,
            title: true,
            order: true,
          },

          orderBy: {
            order: "asc",
          },
        },

        _count: {
          select: {
            enrollments: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }
  /**
   * Admin-removed courses are hidden unless `includeRemoved` is set, which
   * is only used for learners who were already enrolled before removal.
   */
  async findPublishedById(
    id: string,
    { includeRemoved = false }: { includeRemoved?: boolean } = {},
  ) {
    return prisma.course.findFirst({
      where: {
        id,
        status: CourseStatus.PUBLISHED,
        ...(!includeRemoved && {
          moderationStatus: {
            not: CourseModerationStatus.REMOVED,
          },
        }),
      },

      include: {
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

        modules: {
          orderBy: {
            order: "asc",
          },

          include: {
            lessons: {
              orderBy: {
                order: "asc",
              },

              select: {
                id: true,
                title: true,
                order: true,
              },
            },

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

        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });
  }

  /** What a course needs before it can be published (counts only). */
  async findForPublishCheck(courseId: string) {
    return prisma.course.findUnique({
      where: { id: courseId },
      select: {
        modules: {
          orderBy: { order: "asc" },
          select: {
            title: true,
            _count: { select: { lessons: true } },
            quiz: { select: { _count: { select: { questions: true } } } },
          },
        },
        finalQuiz: { select: { _count: { select: { questions: true } } } },
      },
    });
  }
}

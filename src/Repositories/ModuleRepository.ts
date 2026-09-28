import { prisma } from "@/lib/prisma";

export class ModuleRepository {
  async findById(id: string) {
    return prisma.module.findUnique({
      where: { id },

      include: {
        lessons: {
          orderBy: {
            order: "asc",
          },
        },

        quiz: {
          include: {
            questions: true,
          },
        },
      },
    });
  }

  async findByCourseId(courseId: string) {
    return prisma.module.findMany({
      where: {
        courseId,
      },

      orderBy: {
        order: "asc",
      },

      include: {
        lessons: {
          orderBy: {
            order: "asc",
          },
        },

        quiz: {
          include: {
            questions: true,
          },
        },
      },
    });
  }

  async create(data: { courseId: string; title: string; order: number }) {
    return prisma.module.create({
      data,
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      order?: number;
    },
  ) {
    return prisma.module.update({
      where: { id },

      data,
    });
  }

  async delete(id: string) {
    return prisma.module.delete({
      where: { id },
    });
  }

  async findMaxOrder(courseId: string) {
    const courseModule = await prisma.module.findFirst({
      where: {
        courseId,
      },

      orderBy: {
        order: "desc",
      },

      select: {
        order: true,
      },
    });

    return courseModule?.order ?? 0;
  }
}

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export class LessonRepository {
  async create(data: Prisma.LessonCreateInput) {
    return prisma.lesson.create({
      data,
      include: {
        module: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.lesson.findUnique({
      where: { id },
      include: {
        module: true,
      },
    });
  }

  async findByModule(moduleId: string) {
    return prisma.lesson.findMany({
      where: {
        moduleId,
      },
      orderBy: {
        order: "asc",
      },
    });
  }

  async update(
    id: string,
    data: Prisma.LessonUpdateInput,
  ) {
    return prisma.lesson.update({
      where: { id },
      data,
      include: {
        module: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.lesson.delete({
      where: { id },
    });
  }

  async exists(id: string) {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });

    return Boolean(lesson);
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

  async getNextOrder(moduleId: string) {
    const lastLesson = await prisma.lesson.findFirst({
      where: {
        moduleId,
      },
      orderBy: {
        order: "desc",
      },
      select: {
        order: true,
      },
    });

    return (lastLesson?.order ?? 0) + 1;
  }
}
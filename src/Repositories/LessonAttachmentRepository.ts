import { prisma } from "@/lib/prisma";

/** Public shape of an attachment: never includes the storage key. */
export const lessonAttachmentPublicSelect = {
  id: true,
  originalName: true,
  mimeType: true,
  size: true,
  createdAt: true,
} as const;

type CreateLessonAttachmentInput = {
  lessonId: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  size: number;
};

export class LessonAttachmentRepository {
  async create(data: CreateLessonAttachmentInput) {
    return prisma.lessonAttachment.create({
      data,
      select: lessonAttachmentPublicSelect,
    });
  }

  async createMany(data: CreateLessonAttachmentInput[]) {
    return prisma.lessonAttachment.createMany({ data });
  }

  async listByLesson(lessonId: string) {
    return prisma.lessonAttachment.findMany({
      where: { lessonId },
      orderBy: { createdAt: "asc" },
      select: lessonAttachmentPublicSelect,
    });
  }

  /** Storage keys for a lesson's attachments (server-side use only). */
  async listStorageKeysByLesson(lessonId: string) {
    const rows = await prisma.lessonAttachment.findMany({
      where: { lessonId },
      select: { storageKey: true },
    });

    return rows.map((row) => row.storageKey);
  }

  /** Storage keys of every attachment in a module (server-side only). */
  async listStorageKeysByModule(moduleId: string) {
    const rows = await prisma.lessonAttachment.findMany({
      where: { lesson: { moduleId } },
      select: { storageKey: true },
    });

    return rows.map((row) => row.storageKey);
  }

  /** Storage keys of every attachment in a course (server-side only). */
  async listStorageKeysByCourse(courseId: string) {
    const rows = await prisma.lessonAttachment.findMany({
      where: { lesson: { module: { courseId } } },
      select: { storageKey: true },
    });

    return rows.map((row) => row.storageKey);
  }

  async countByLesson(lessonId: string) {
    return prisma.lessonAttachment.count({ where: { lessonId } });
  }

  /** Full row plus the owning course, for authorization (server-side only). */
  async findById(id: string) {
    return prisma.lessonAttachment.findUnique({
      where: { id },
      include: {
        lesson: {
          select: {
            id: true,
            module: { select: { courseId: true } },
          },
        },
      },
    });
  }

  async existsByStorageKey(storageKey: string) {
    const row = await prisma.lessonAttachment.findUnique({
      where: { storageKey },
      select: { id: true },
    });

    return Boolean(row);
  }

  async delete(id: string) {
    return prisma.lessonAttachment.delete({ where: { id } });
  }

  async deleteManyByLesson(lessonId: string) {
    return prisma.lessonAttachment.deleteMany({ where: { lessonId } });
  }
}

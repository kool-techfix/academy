import { randomUUID } from "node:crypto";

import { InstructorStatus, Role } from "@/generated/prisma/client";
import {
  getAttachmentExtension,
  getAttachmentMimeType,
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_ATTACHMENTS_PER_LESSON,
} from "@/lib/storage/constants";
import {
  createDownloadUrl,
  createUploadUrl,
  deleteObject,
  headObject,
} from "@/lib/storage/r2";
import { ATTACHMENT_ERRORS, MODULE_LESSON_LIMIT } from "@/lib/storage/errors";
import { CourseRepository } from "@/Repositories/CourseRepository";
import { EnrollmentRepository } from "@/Repositories/EnrollmentRepository";
import { LessonAttachmentRepository } from "@/Repositories/LessonAttachmentRepository";
import { LessonRepository } from "@/Repositories/LessonRepository";
import type {
  AttachmentUploadUrlInput,
  LessonAttachmentPayload,
} from "@/Schemas/lesson-attachment.schema";

export type CreateLessonData = {
  title: string;
  youtubeVideoLink: string;
  notesFileUrl?: string | null;
  order?: number;
  attachments?: LessonAttachmentPayload[];
};

export type UpdateLessonData = {
  title?: string;
  youtubeVideoLink?: string;
  notesFileUrl?: string | null;
  order?: number;
  attachments?: LessonAttachmentPayload[];
};


type AttachmentRequester = {
  id: string;
  role: Role;
  instructorStatus: InstructorStatus | null;
};

/** `lessons/{courseId}/{uuid}-{name}` — every key for a course shares this prefix. */
function attachmentKeyPrefix(courseId: string) {
  return `lessons/${courseId}/`;
}

/** Keep keys URL- and filesystem-safe: ASCII letters, digits, `-`, `_`, `.`. */
function sanitizeFilename(filename: string, extension: string) {
  const base = filename
    .slice(0, filename.length - extension.length - 1)
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9_.-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 80);

  return `${base || "file"}.${extension}`;
}

/** Storage cleanup must never fail the request that triggered it. */
async function deleteObjectsBestEffort(keys: string[]) {
  await Promise.all(
    keys.map(async (key) => {
      try {
        await deleteObject(key);
      } catch (error) {
        console.error(`Failed to delete R2 object ${key}:`, error);
      }
    }),
  );
}

export class LessonService {
  private lessonRepository: LessonRepository;
  private courseRepository: CourseRepository;
  private attachmentRepository: LessonAttachmentRepository;
  private enrollmentRepository: EnrollmentRepository;

  constructor() {
    this.lessonRepository = new LessonRepository();
    this.courseRepository = new CourseRepository();
    this.attachmentRepository = new LessonAttachmentRepository();
    this.enrollmentRepository = new EnrollmentRepository();
  }

  /**
   * Get all lessons belonging to a module.
   */
  async getLessonsByModule(moduleId: string) {
    return this.lessonRepository.findByModule(moduleId);
  }

  /**
   * Get a single lesson.
   */
  async getLesson(lessonId: string) {
    const lesson = await this.lessonRepository.findById(lessonId);

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    return lesson;
  }

  /**
   * Create a lesson inside a module.
   */
  async createLesson(
    instructorId: string,
    moduleId: string,
    data: CreateLessonData,
  ) {
    const courseModule = await this.getModuleWithCourse(moduleId);

    await this.ensureInstructorHasAccess(instructorId, courseModule.courseId);

    if (!data.title?.trim()) {
      throw new Error("Lesson title is required");
    }

    if (!data.youtubeVideoLink) {
      throw new Error("YouTube video Link is required");
    }

    // Each module holds exactly one lesson.
    if ((await this.lessonRepository.countByModule(moduleId)) > 0) {
      throw new Error(MODULE_LESSON_LIMIT);
    }

    const attachments = await this.validateNewAttachments(
      courseModule.courseId,
      data.attachments ?? [],
      0,
    );

    const order =
      data.order ?? (await this.lessonRepository.getNextOrder(moduleId));

    const lesson = await this.lessonRepository.create({
      title: data.title.trim(),
      youtubeVideoLink: data.youtubeVideoLink.trim(),
      notesFileUrl: data.notesFileUrl ?? null,
      order,
      module: {
        connect: {
          id: moduleId,
        },
      },
    });

    if (attachments.length === 0) {
      return lesson;
    }

    await this.saveAttachments(lesson.id, attachments);

    return this.getLesson(lesson.id);
  }

  /**
   * Update a lesson.
   */
  async updateLesson(
    instructorId: string,
    lessonId: string,
    data: UpdateLessonData,
  ) {
    const lesson = await this.lessonRepository.findById(lessonId);

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    await this.ensureInstructorHasAccess(instructorId, lesson.module.courseId);

    const attachments = await this.validateNewAttachments(
      lesson.module.courseId,
      data.attachments ?? [],
      await this.attachmentRepository.countByLesson(lessonId),
    );

    const updateData: Omit<UpdateLessonData, "attachments"> = {};

    if (data.title !== undefined) {
      if (!data.title.trim()) {
        throw new Error("Lesson title is required");
      }

      updateData.title = data.title.trim();
    }

    if (data.youtubeVideoLink !== undefined) {
      if (!data.youtubeVideoLink.trim()) {
        throw new Error("YouTube video Link is required");
      }

      updateData.youtubeVideoLink = data.youtubeVideoLink.trim();
    }

    if (data.notesFileUrl !== undefined) {
      updateData.notesFileUrl = data.notesFileUrl;
    }

    if (data.order !== undefined) {
      updateData.order = data.order;
    }

    const updated = await this.lessonRepository.update(lessonId, updateData);

    if (attachments.length === 0) {
      return updated;
    }

    await this.saveAttachments(lessonId, attachments);

    return this.getLesson(lessonId);
  }

  /**
   * Delete a lesson.
   */
  async deleteLesson(instructorId: string, lessonId: string) {
    const lesson = await this.lessonRepository.findById(lessonId);

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    await this.ensureInstructorHasAccess(instructorId, lesson.module.courseId);

    const storageKeys =
      await this.attachmentRepository.listStorageKeysByLesson(lessonId);

    // Attachment rows cascade with the lesson; the R2 objects are ours to remove.
    await this.lessonRepository.delete(lessonId);

    await deleteObjectsBestEffort(storageKeys);
  }

  /**
   * Presigned PUT for a new attachment. The browser uploads straight to R2;
   * the returned key is attached to the lesson when the lesson is saved.
   */
  async createAttachmentUploadUrl(
    instructorId: string,
    courseId: string,
    input: AttachmentUploadUrlInput,
  ) {
    await this.ensureInstructorHasAccess(instructorId, courseId);

    if (input.lessonId) {
      const lesson = await this.lessonRepository.findById(input.lessonId);

      if (!lesson || lesson.module.courseId !== courseId) {
        throw new Error("Lesson not found");
      }
    }

    const extension = getAttachmentExtension(input.filename);

    if (!extension || getAttachmentMimeType(input.filename) !== input.contentType) {
      throw new Error(ATTACHMENT_ERRORS.typeNotAllowed);
    }

    if (input.size > MAX_ATTACHMENT_SIZE_BYTES) {
      throw new Error(ATTACHMENT_ERRORS.tooLarge);
    }

    const key = `${attachmentKeyPrefix(courseId)}${randomUUID()}-${sanitizeFilename(
      input.filename,
      extension,
    )}`;

    const uploadUrl = await createUploadUrl({
      key,
      contentType: input.contentType,
      size: input.size,
    });

    return { uploadUrl, key };
  }

  /** Remove one attachment: the row first, then the R2 object (best effort). */
  async removeAttachment(
    instructorId: string,
    lessonId: string,
    attachmentId: string,
  ) {
    const attachment = await this.attachmentRepository.findById(attachmentId);

    if (!attachment || attachment.lessonId !== lessonId) {
      throw new Error(ATTACHMENT_ERRORS.notFound);
    }

    await this.ensureInstructorHasAccess(
      instructorId,
      attachment.lesson.module.courseId,
    );

    await this.attachmentRepository.delete(attachmentId);

    await deleteObjectsBestEffort([attachment.storageKey]);
  }

  /**
   * Short-lived download URL. Allowed for approved instructors who author the
   * course, and learners with an ACTIVE or COMPLETED enrollment in it.
   */
  async getAttachmentDownloadUrl(
    requester: AttachmentRequester,
    attachmentId: string,
  ) {
    const attachment = await this.attachmentRepository.findById(attachmentId);

    if (!attachment) {
      throw new Error(ATTACHMENT_ERRORS.notFound);
    }

    const courseId = attachment.lesson.module.courseId;

    if (!(await this.canDownload(requester, courseId))) {
      throw new Error(ATTACHMENT_ERRORS.forbidden);
    }

    const url = await createDownloadUrl({
      key: attachment.storageKey,
      filename: attachment.originalName,
      contentType: attachment.mimeType,
    });

    return { url };
  }

  private async canDownload(requester: AttachmentRequester, courseId: string) {
    if (requester.role === Role.INSTRUCTOR) {
      return (
        requester.instructorStatus === InstructorStatus.APPROVED &&
        (await this.courseRepository.isAuthor(courseId, requester.id))
      );
    }

    if (requester.role === Role.LEARNER) {
      const enrollment = await this.enrollmentRepository.findByUserAndCourse(
        requester.id,
        courseId,
      );

      return (
        enrollment?.status === "ACTIVE" || enrollment?.status === "COMPLETED"
      );
    }

    return false;
  }

  /**
   * Check attachments sent with a lesson save. The key must be one we issued
   * for this course, unused, and the uploaded object must exist in R2 with
   * the declared type and size — so a client can't attach arbitrary objects
   * or sneak past the size limit.
   */
  private async validateNewAttachments(
    courseId: string,
    attachments: LessonAttachmentPayload[],
    existingCount: number,
  ) {
    if (attachments.length === 0) {
      return [];
    }

    if (existingCount + attachments.length > MAX_ATTACHMENTS_PER_LESSON) {
      throw new Error(ATTACHMENT_ERRORS.tooMany);
    }

    const prefix = attachmentKeyPrefix(courseId);
    const keys = new Set<string>();

    for (const attachment of attachments) {
      const keyName = attachment.key.slice(prefix.length);

      if (
        !attachment.key.startsWith(prefix) ||
        keyName.length === 0 ||
        keyName.includes("/") ||
        keys.has(attachment.key)
      ) {
        throw new Error(ATTACHMENT_ERRORS.invalid);
      }

      keys.add(attachment.key);

      if (getAttachmentMimeType(attachment.originalName) !== attachment.mimeType) {
        throw new Error(ATTACHMENT_ERRORS.typeNotAllowed);
      }

      if (attachment.size > MAX_ATTACHMENT_SIZE_BYTES) {
        throw new Error(ATTACHMENT_ERRORS.tooLarge);
      }

      if (await this.attachmentRepository.existsByStorageKey(attachment.key)) {
        throw new Error(ATTACHMENT_ERRORS.invalid);
      }

      const object = await headObject(attachment.key);

      if (
        !object ||
        object.size !== attachment.size ||
        object.size > MAX_ATTACHMENT_SIZE_BYTES ||
        object.contentType !== attachment.mimeType
      ) {
        throw new Error(ATTACHMENT_ERRORS.invalid);
      }
    }

    return attachments;
  }

  private async saveAttachments(
    lessonId: string,
    attachments: LessonAttachmentPayload[],
  ) {
    await this.attachmentRepository.createMany(
      attachments.map((attachment) => ({
        lessonId,
        storageKey: attachment.key,
        originalName: attachment.originalName,
        mimeType: attachment.mimeType,
        size: attachment.size,
      })),
    );
  }

  /**
   * Get module together with its course.
   *
   * We need the course ID so we can verify
   * that the instructor actually owns/contributes
   * to the course.
   */
  private async getModuleWithCourse(moduleId: string) {
    const courseModule = await this.lessonRepository.getModuleWithCourse(moduleId);

    if (!courseModule) {
      throw new Error("Module not found");
    }

    return courseModule;
  }

  /**
   * Make sure the instructor has access to the course.
   */
  private async ensureInstructorHasAccess(
    instructorId: string,
    courseId: string,
  ) {
    const isAuthor = await this.courseRepository.isAuthor(
      courseId,
      instructorId,
    );

    if (!isAuthor) {
      throw new Error("You do not have permission to manage this lesson");
    }
  }
}

import { LessonRepository } from "@/Repositories/LessonRepository";
import { CourseRepository } from "@/Repositories/CourseRepository";

export type CreateLessonData = {
  title: string;
  youtubeVideoLink: string;
  notesFileUrl?: string | null;
  order?: number;
};

export type UpdateLessonData = {
  title?: string;
  youtubeVideoLink?: string;
  notesFileUrl?: string | null;
  order?: number;
};

export class LessonService {
  private lessonRepository: LessonRepository;
  private courseRepository: CourseRepository;

  constructor() {
    this.lessonRepository = new LessonRepository();
    this.courseRepository = new CourseRepository();
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
    const module = await this.getModuleWithCourse(moduleId);

    await this.ensureInstructorHasAccess(instructorId, module.courseId);

    if (!data.title?.trim()) {
      throw new Error("Lesson title is required");
    }

    if (!data.youtubeVideoLink) {
      throw new Error("YouTube video Link is required");
    }

    const order =
      data.order ?? (await this.lessonRepository.getNextOrder(moduleId));

    return this.lessonRepository.create({
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

    const updateData: UpdateLessonData = {};

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

    return this.lessonRepository.update(lessonId, updateData);
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

    await this.lessonRepository.delete(lessonId);
  }

  /**
   * Get module together with its course.
   *
   * We need the course ID so we can verify
   * that the instructor actually owns/contributes
   * to the course.
   */
  private async getModuleWithCourse(moduleId: string) {
    const module = await this.lessonRepository.getModuleWithCourse(moduleId);

    if (!module) {
      throw new Error("Module not found");
    }

    return module;
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

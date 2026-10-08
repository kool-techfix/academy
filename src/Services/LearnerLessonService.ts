import { LessonRepository } from "@/Repositories/LessonRepository";
import { LearnerAccessService } from "@/Services/LearnerAccessService";

export class LearnerLessonService {
  constructor(
    private readonly lessonRepository =
      new LessonRepository(),

    private readonly access =
      new LearnerAccessService(),
  ) {}

  /**
   * Get a lesson for an enrolled learner.
   */
  async getLesson(
    userId: string,
    lessonId: string,
  ) {
    const lesson =
      await this.lessonRepository.findByIdForLearner(
        lessonId,
      );

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    const courseId = lesson.module.courseId;

    await this.access.assertEnrolled(userId, courseId);

    await this.access.assertModuleUnlocked(
      userId,
      courseId,
      lesson.module.id,
    );

    return lesson;
  }
}
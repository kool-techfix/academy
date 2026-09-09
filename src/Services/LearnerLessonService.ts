import { EnrollmentRepository } from "@/Repositories/EnrollmentRepository";
import { LessonRepository } from "@/Repositories/LessonRepository";

export class LearnerLessonService {
  constructor(
    private readonly lessonRepository =
      new LessonRepository(),

    private readonly enrollmentRepository =
      new EnrollmentRepository(),
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

    const enrollment =
      await this.enrollmentRepository.findByUserAndCourse(
        userId,
        courseId,
      );

    if (!enrollment) {
      throw new Error(
        "You are not enrolled in this course",
      );
    }

    return lesson;
  }
}
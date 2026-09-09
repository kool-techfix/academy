import { CourseRepository } from "@/Repositories/CourseRepository";
import { EnrollmentRepository } from "@/Repositories/EnrollmentRepository";
import { ProgressRepository } from "@/Repositories/ProgressRepository";

export class LearnerProgressService {
  constructor(
    private readonly progressRepository = new ProgressRepository(),

    private readonly courseRepository = new CourseRepository(),

    private readonly enrollmentRepository = new EnrollmentRepository(),
  ) {}

  /**
   * Mark a lesson as completed.
   */
  async completeLesson(userId: string, lessonId: string) {
    const lesson = await this.progressRepository.findLessonWithCourse(lessonId);

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    const courseId = lesson.module.courseId;

    const enrollment = await this.enrollmentRepository.findByUserAndCourse(
      userId,
      courseId,
    );

    if (!enrollment) {
      throw new Error("You are not enrolled in this course");
    }

    return this.progressRepository.markLessonCompleted(userId, lessonId);
  }

  /**
   * Get a learner's progress for a course.
   */
  async getCourseProgress(userId: string, courseId: string) {
    const course = await this.courseRepository.findPublishedById(courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    const completedProgress = await this.progressRepository.findByUserAndCourse(
      userId,
      courseId,
    );

    const totalLessons = course.modules.reduce(
      (total, module) => total + module.lessons.length,
      0,
    );

    const completedLessons = completedProgress.length;

    const percentage =
      totalLessons === 0
        ? 0
        : Math.round((completedLessons / totalLessons) * 100);

    const lastActivityAt = completedProgress[0]?.completedAt ?? null;

    return {
      courseId,
      totalLessons,
      completedLessons,
      percentage,
      completedLessonIds: completedProgress.map(
        (progress) => progress.lesson.id,
      ),
      lastActivityAt,
    };
  }
}

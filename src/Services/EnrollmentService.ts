import { CourseRepository } from "@/Repositories/CourseRepository";
import { EnrollmentRepository } from "@/Repositories/EnrollmentRepository";

export class EnrollmentService {
  constructor(
    private readonly enrollmentRepository =
      new EnrollmentRepository(),

    private readonly courseRepository =
      new CourseRepository(),
  ) {}

  /**
   * Enroll a learner in a published course.
   */
  async enroll(userId: string, courseId: string) {
    const course =
      await this.courseRepository.findPublishedById(courseId);

    if (!course) {
      throw new Error(
        "Course not found or not available for enrollment",
      );
    }

    const existingEnrollment =
      await this.enrollmentRepository.findByUserAndCourse(
        userId,
        courseId,
      );

    if (existingEnrollment) {
      throw new Error(
        "You are already enrolled in this course",
      );
    }

    return this.enrollmentRepository.create(
      userId,
      courseId,
    );
  }

  /**
   * Get all courses the learner is enrolled in.
   */
  async getLearnerEnrollments(userId: string) {
    return this.enrollmentRepository.findByUser(userId);
  }
}
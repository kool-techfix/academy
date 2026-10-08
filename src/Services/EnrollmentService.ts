import { CourseRepository } from "@/Repositories/CourseRepository";
import { EnrollmentRepository } from "@/Repositories/EnrollmentRepository";

export class EnrollmentService {
  constructor(
    private readonly enrollmentRepository = new EnrollmentRepository(),
    private readonly courseRepository = new CourseRepository(),
  ) {}

  /**
   * Enroll a learner in a published course.
   */
  async enroll(userId: string, courseId: string) {
    const course = await this.courseRepository.findPublishedById(courseId);

    if (!course) {
      throw new Error("Course not found or not available for enrollment");
    }

    const existingEnrollment =
      await this.enrollmentRepository.findByUserAndCourse(userId, courseId);

    // A cancelled enrollment can be picked up again; progress is kept.
    if (existingEnrollment?.status === "CANCELLED") {
      return this.enrollmentRepository.reactivate(existingEnrollment.id);
    }

    if (existingEnrollment) {
      throw new Error("You are already enrolled in this course");
    }

    return this.enrollmentRepository.create(userId, courseId);
  }

  /**
   * Get all courses the learner is enrolled in.
   */
  async getLearnerEnrollments(userId: string) {
    return this.enrollmentRepository.findByUser(userId);
  }

  /**
   * Get all learners enrolled in a course.
   *
   * Only an instructor who is an author of the course can access
   * the enrollee list.
   */

  async getCourseEnrollees(courseId: string, instructorId: string) {
    await this.assertCourseAuthor(courseId, instructorId);

    const result =
      await this.enrollmentRepository.findCourseEnrollees(courseId);

    if (!result) {
      throw new Error("Course not found");
    }

    const { course, enrollments } = result;

    const moduleQuizIds = new Set(
      course.modules
        .map((module) => module.quiz?.id)
        .filter((id): id is string => Boolean(id)),
    );

    const enrollees = enrollments.map((enrollment) => {
      const passedModuleQuizIds = new Set(
        enrollment.user.quizAttempts
          .filter(
            (attempt) => moduleQuizIds.has(attempt.quizId) && attempt.passed,
          )
          .map((attempt) => attempt.quizId),
      );

      const totalModules = course.modules.length;

      const completedModules = course.modules.filter(
        (module) => module.quiz && passedModuleQuizIds.has(module.quiz.id),
      ).length;

      const progress =
        totalModules > 0
          ? Math.round((completedModules / totalModules) * 100)
          : 0;

      const finalAssessmentResult = this.getLatestFinalAssessmentScore(
        enrollment.user.quizAttempts,
        course.finalQuiz?.id,
      );

      return {
        id: enrollment.user.id,
        name: enrollment.user.name,
        progress,
        finalAssessmentResult,
      };
    });

    return {
      course: {
        id: course.id,
        title: course.title,
      },
      enrollees,
    };
  }

  /**
   * Get details for a specific learner enrolled in a course.
   *
   * Only an instructor who is an author of the course can access
   * the enrollee details.
   */

  async getCourseEnrollee(
    courseId: string,
    learnerId: string,
    instructorId: string,
  ) {
    await this.assertCourseAuthor(courseId, instructorId);

    const enrollment = await this.enrollmentRepository.findCourseEnrollee(
      courseId,
      learnerId,
    );

    if (!enrollment) {
      throw new Error("Learner is not enrolled in this course");
    }

    const { course, user } = enrollment;

    const moduleResults = course.modules.map((module) => {
      const quizId = module.quiz?.id;
      const total = module.quiz?.questions.length ?? 0;

      if (!quizId) {
        return {
          moduleId: module.id,
          moduleOrder: module.order,
          moduleTitle: module.title,
          score: 0,
          total,
          passed: false,
          hasAttempt: false,
        };
      }

      const latestAttempt = this.getLatestAttempt(user.quizAttempts, quizId);

      if (!latestAttempt) {
        return {
          moduleId: module.id,
          moduleOrder: module.order,
          moduleTitle: module.title,
          score: 0,
          total,
          passed: false,
          hasAttempt: false,
        };
      }

      return {
        moduleId: module.id,
        moduleOrder: module.order,
        moduleTitle: module.title,
        score: latestAttempt.score,
        total,
        passed: latestAttempt.passed,
        hasAttempt: true,
      };
    });

    const completedModules = moduleResults.filter(
      (result) => result.passed,
    ).length;

    const totalModules = course.modules.length;

    const progress =
      totalModules > 0
        ? Math.round((completedModules / totalModules) * 100)
        : 0;

    const finalAssessmentResult = this.getLatestFinalAssessmentScore(
      user.quizAttempts,
      course.finalQuiz?.id,
    );

    return {
      course: {
        id: course.id,
        title: course.title,
      },
      learner: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      progress,
      moduleResults,
      finalAssessmentResult,
    };
  }

  /**
   * Ensure the instructor has access to the course.
   */
  private async assertCourseAuthor(courseId: string, instructorId: string) {
    const isAuthor = await this.courseRepository.isAuthor(
      courseId,
      instructorId,
    );

    if (!isAuthor) {
      throw new Error("You do not have access to this course");
    }
  }

  /**
   * Get the most recent attempt for a quiz.
   */
  private getLatestAttempt(
    attempts: Array<{
      quizId: string;
      score: number;
      passed: boolean;
      attemptedAt: Date;
    }>,
    quizId: string,
  ) {
    return attempts.find((attempt) => attempt.quizId === quizId);
  }

  /**
   * Get the latest final assessment score.
   *
   * Returns "In progress" when the learner has not attempted
   * the final assessment.
   */
  private getLatestFinalAssessmentScore(
    attempts: Array<{
      quizId: string;
      score: number;
      passed: boolean;
      attemptedAt: Date;
    }>,
    finalQuizId?: string,
  ): number | "In progress" {
    if (!finalQuizId) {
      return "In progress";
    }

    const latestAttempt = this.getLatestAttempt(attempts, finalQuizId);

    return latestAttempt?.score ?? "In progress";
  }
}

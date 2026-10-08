import { MODULE_LOCKED, NOT_ENROLLED, RETAKE_NOT_ALLOWED } from "@/lib/learner-access";
import { EnrollmentRepository } from "@/Repositories/EnrollmentRepository";
import { LearnerQuizRepository } from "@/Repositories/LearnerQuizRepository";
import { QuizAttemptRepository } from "@/Repositories/QuizAttemptRepository";

/**
 * Server-side versions of the rules the learner UI shows: the course page
 * locks modules, but these checks are what actually stop a learner from
 * opening or submitting something they haven't unlocked.
 */
export class LearnerAccessService {
  constructor(
    private readonly enrollmentRepository = new EnrollmentRepository(),
    private readonly quizRepository = new LearnerQuizRepository(),
    private readonly quizAttemptRepository = new QuizAttemptRepository(),
  ) {}

  /** Active or completed enrollment; cancelled enrollments lose access. */
  async assertEnrolled(userId: string, courseId: string) {
    const enrollment = await this.enrollmentRepository.findByUserAndCourse(
      userId,
      courseId,
    );

    if (!enrollment || enrollment.status === "CANCELLED") {
      throw new Error(NOT_ENROLLED);
    }

    return enrollment;
  }

  /**
   * A module is unlocked when every earlier module's quiz has been passed
   * (the first module is always open) — same rule as the course page.
   */
  async assertModuleUnlocked(
    userId: string,
    courseId: string,
    moduleId: string,
  ) {
    const course = await this.quizRepository.findCourseWithModules(courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    const index = course.modules.findIndex((module) => module.id === moduleId);

    if (index === -1) {
      throw new Error("Module not found");
    }

    if (index === 0) {
      return;
    }

    const passed = new Set(
      await this.quizAttemptRepository.findPassedModuleQuizIds(
        userId,
        courseId,
      ),
    );

    const locked = course.modules
      .slice(0, index)
      .some((module) => !module.quiz || !passed.has(module.quiz.id));

    if (locked) {
      throw new Error(MODULE_LOCKED);
    }
  }

  /**
   * A final assessment with allowRetake = false accepts a single attempt;
   * a learner who fails it can restart the whole course instead. Module
   * quizzes can always be retaken (otherwise one failure would lock every
   * later module for good).
   */
  async assertCanAttempt(
    userId: string,
    quiz: { id: string; type: string; allowRetake: boolean },
  ) {
    if (quiz.type !== "FINAL" || quiz.allowRetake) {
      return;
    }

    const attempts = await this.quizAttemptRepository.countByUserAndQuiz(
      userId,
      quiz.id,
    );

    if (attempts > 0) {
      throw new Error(RETAKE_NOT_ALLOWED);
    }
  }
}

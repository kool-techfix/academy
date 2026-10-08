import { CourseRepository } from "@/Repositories/CourseRepository";
import { EnrollmentRepository } from "@/Repositories/EnrollmentRepository";
import { ProgressRepository } from "@/Repositories/ProgressRepository";
import { QuizAttemptRepository } from "@/Repositories/QuizAttemptRepository";
import { RESTART_NOT_AVAILABLE } from "@/lib/learner-access";
import { LearnerAccessService } from "@/Services/LearnerAccessService";

export class LearnerProgressService {
  constructor(
    private readonly progressRepository = new ProgressRepository(),
    private readonly courseRepository = new CourseRepository(),
    private readonly enrollmentRepository = new EnrollmentRepository(),
    private readonly quizAttemptRepository = new QuizAttemptRepository(),
    private readonly access = new LearnerAccessService(),
  ) {}

  /**
   * Mark a lesson as completed.
   *
   * Lesson completion is tracked separately from
   * module and course completion.
   */
  async completeLesson(userId: string, lessonId: string) {
    const lesson = await this.progressRepository.findLessonWithCourse(lessonId);

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    const courseId = lesson.module.courseId;

    await this.access.assertEnrolled(userId, courseId);

    await this.access.assertModuleUnlocked(userId, courseId, lesson.module.id);

    return this.progressRepository.markLessonCompleted(userId, lessonId);
  }

  /**
   * Start a course over after failing a final assessment that doesn't
   * allow retakes. The enrollment is kept; attempts and progress reset.
   */
  async restartCourse(userId: string, courseId: string) {
    const progress = await this.getCourseProgress(userId, courseId);

    const failedFinalWithoutRetakes =
      progress.finalQuiz.exists &&
      !progress.finalQuiz.allowRetake &&
      progress.finalQuiz.attempted &&
      !progress.finalQuiz.passed;

    if (!failedFinalWithoutRetakes) {
      throw new Error(RESTART_NOT_AVAILABLE);
    }

    await this.enrollmentRepository.resetCourseProgress(userId, courseId);

    return this.getCourseProgress(userId, courseId);
  }

  /**
   * Get a learner's progress for a course.
   *
   * Course progress is based on passed module quizzes.
   */
  async getCourseProgress(userId: string, courseId: string) {
    const course = await this.courseRepository.findPublishedById(courseId, {
      includeRemoved: true,
    });

    if (!course) {
      throw new Error("Course not found");
    }

    await this.access.assertEnrolled(userId, courseId);

    const passedModuleQuizIds =
      await this.quizAttemptRepository.findPassedModuleQuizIds(
        userId,
        courseId,
      );

    const finalQuizStatus =
      await this.quizAttemptRepository.findFinalQuizStatus(userId, courseId);

    const totalModules = course.modules.length;

    const completedModules = course.modules.filter(
      (module) => module.quiz && passedModuleQuizIds.includes(module.quiz.id),
    ).length;

    const percentage =
      totalModules === 0
        ? 0
        : Math.round((completedModules / totalModules) * 100);

    const completedModuleIds = course.modules
      .filter(
        (module) => module.quiz && passedModuleQuizIds.includes(module.quiz.id),
      )
      .map((module) => module.id);

    const allModulesCompleted =
      totalModules > 0 && completedModules === totalModules;

    const completed = allModulesCompleted && finalQuizStatus.attempted;

    const certificateEligible = allModulesCompleted && finalQuizStatus.passed;

    return {
      courseId,
      totalModules,
      completedModules,
      percentage,
      completedModuleIds,

      finalQuiz: {
        exists: Boolean(course.finalQuiz),
        allowRetake: course.finalQuiz?.allowRetake ?? true,
        attempted: finalQuizStatus.attempted,
        passed: finalQuizStatus.passed,
        lastAttemptAt: finalQuizStatus.lastAttemptAt,
      },

      completed,
      certificateEligible,

      lastActivityAt: finalQuizStatus.lastAttemptAt ?? null,
    };
  }

  async getAllCourseProgress(userId: string) {
  const enrollments =
    await this.enrollmentRepository.findByUser(userId);

  if (enrollments.length === 0) {
    return [];
  }

  const attempts =
    await this.quizAttemptRepository.findCourseProgressData(
      userId,
    );

  const progressByCourse = new Map<
    string,
    {
      passedModuleQuizIds: Set<string>;
      finalAttempted: boolean;
      finalPassed: boolean;
      lastAttemptAt: Date | null;
    }
  >();

  for (const attempt of attempts) {
    const courseId =
      attempt.quiz.courseId ??
      attempt.quiz.module?.courseId;

    if (!courseId) {
      continue;
    }

    let courseProgress =
      progressByCourse.get(courseId);

    if (!courseProgress) {
      courseProgress = {
        passedModuleQuizIds: new Set<string>(),
        finalAttempted: false,
        finalPassed: false,
        lastAttemptAt: null,
      };

      progressByCourse.set(courseId, courseProgress);
    }

    if (
      attempt.quiz.type === "MODULE" &&
      attempt.passed
    ) {
      courseProgress.passedModuleQuizIds.add(
        attempt.quizId,
      );
    }

    if (attempt.quiz.type === "FINAL") {
      courseProgress.finalAttempted = true;

      if (attempt.passed) {
        courseProgress.finalPassed = true;
      }
    }

    if (
      !courseProgress.lastAttemptAt ||
      attempt.attemptedAt >
        courseProgress.lastAttemptAt
    ) {
      courseProgress.lastAttemptAt =
        attempt.attemptedAt;
    }
  }

  return enrollments.map((enrollment) => {
    const course = enrollment.course;

    const courseProgress =
      progressByCourse.get(course.id);

    const passedModuleQuizIds =
      courseProgress?.passedModuleQuizIds ??
      new Set<string>();

    const completedModules = course.modules.filter(
      (module) =>
        module.quiz &&
        passedModuleQuizIds.has(module.quiz.id),
    );

    const totalModules =
      course.modules.length;

    const completedModuleCount =
      completedModules.length;

    const percentage =
      totalModules === 0
        ? 0
        : Math.round(
            (completedModuleCount /
              totalModules) *
              100,
          );

    const completedModuleIds =
      completedModules.map(
        (module) => module.id,
      );

    const allModulesCompleted =
      totalModules > 0 &&
      completedModuleCount === totalModules;

    const finalAttempted =
      courseProgress?.finalAttempted ?? false;

    const finalPassed =
      courseProgress?.finalPassed ?? false;

    return {
      courseId: course.id,
      totalModules,
      completedModules:
        completedModuleCount,
      percentage,
      completedModuleIds,

      finalQuiz: {
        attempted: finalAttempted,
        passed: finalPassed,
        lastAttemptAt:
          courseProgress?.lastAttemptAt ?? null,
      },

      completed:
        allModulesCompleted &&
        finalAttempted,

      certificateEligible:
        allModulesCompleted &&
        finalPassed,

      lastActivityAt:
        courseProgress?.lastAttemptAt ?? null,
    };
  });
}
}

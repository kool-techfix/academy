import type { LearnerCourseProgress } from "@/Services/progress.service";
import type { LearnerEnrollment } from "@/Services/enrollment.service";

export type LearnerDashboardCourse = {
  enrollment: LearnerEnrollment;
  progress: LearnerCourseProgress | null;
};


export function getContinueLearningCourse(
  courses: LearnerDashboardCourse[],
) {
  /**
   * First priority:
   * Courses where the learner has started but not
   * completed all modules.
   */
  const inProgress = courses
    .filter(({ progress }) => {
      if (!progress) {
        return false;
      }

      return (
        progress.completedModules > 0 &&
        progress.completedModules < progress.totalModules
      );
    })
    .sort((a, b) => {
      const aTime = a.progress?.lastActivityAt
        ? new Date(a.progress.lastActivityAt).getTime()
        : 0;

      const bTime = b.progress?.lastActivityAt
        ? new Date(b.progress.lastActivityAt).getTime()
        : 0;

      return bTime - aTime;
    });

  if (inProgress.length > 0) {
    return inProgress[0];
  }

  /**
   * Second priority:
   * Courses where all modules are completed but
   * the final quiz has not been attempted yet.
   */
  const awaitingFinalQuiz = courses.find(
    ({ progress }) =>
      progress &&
      progress.completedModules === progress.totalModules &&
      progress.totalModules > 0 &&
      !progress.finalQuiz.attempted,
  );

  if (awaitingFinalQuiz) {
    return awaitingFinalQuiz;
  }

  /**
   * Third priority:
   * Courses where the final quiz was attempted but
   * not passed, provided the course is not certificate
   * eligible yet.
   *
   * Since the final quiz route does not exist yet,
   * this still points to the course page.
   */
  const finalQuizNeedsRetake = courses.find(
    ({ progress }) =>
      progress &&
      progress.completedModules === progress.totalModules &&
      progress.totalModules > 0 &&
      progress.finalQuiz.attempted &&
      !progress.finalQuiz.passed &&
      !progress.certificateEligible,
  );

  if (finalQuizNeedsRetake) {
    return finalQuizNeedsRetake;
  }

  /**
   * Finally, return a newly enrolled course that has
   * no progress activity yet.
   */
  return (
    courses.find(
      ({ progress }) =>
        progress &&
        progress.completedModules === 0,
    ) ?? null
  );
}
export type LearnerCourseStatus =
  | "not-started"
  | "in-progress"
  | "completed";

export function getLearnerCourseStatus(
  progress: LearnerCourseProgress | null,
): LearnerCourseStatus {
  if (!progress || progress.percentage === 0) {
    return "not-started";
  }

  if (progress.percentage >= 100) {
    return "completed";
  }

  return "in-progress";
}

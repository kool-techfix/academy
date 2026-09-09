import type { LearnerCourseProgress } from "@/Services/progress.service";
import type { LearnerEnrollment } from "@/Services/enrollment.service";

export type LearnerDashboardCourse = {
  enrollment: LearnerEnrollment;
  progress: LearnerCourseProgress | null;
};

export function getContinueLearningCourse(
  courses: LearnerDashboardCourse[],
) {
  const inProgress = courses
    .filter(
      ({ progress }) =>
        progress !== null &&
        progress.percentage > 0 &&
        progress.percentage < 100,
    )
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

  return (
    courses.find(
      ({ progress }) =>
        progress !== null &&
        progress.percentage === 0,
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

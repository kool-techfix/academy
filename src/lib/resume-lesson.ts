import type { LearnerCourseProgress } from "@/Services/progress.service";
import { PublicCourseDetail } from "@/Services/public-course.service";

export function getResumeLesson(
  course: PublicCourseDetail,
  progress: LearnerCourseProgress | null,
) {
  if (!progress) {
    return null;
  }

  const completedLessonIds = new Set(
    progress.completedLessonIds,
  );

  const orderedLessons = course.modules
  .slice()
  .sort((a, b) => a.order - b.order)
  .flatMap((module) =>
    module.lessons
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((lesson) => ({
        ...lesson,
        moduleId: module.id,
        moduleTitle: module.title,
        moduleOrder: module.order,
      })),
  );

  return (
    orderedLessons.find(
      (lesson) => !completedLessonIds.has(lesson.id),
    ) ?? null
  );
}
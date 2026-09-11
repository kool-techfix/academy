import { ProgressRepository } from "@/Repositories/ProgressRepository";
import { QuizAttemptRepository } from "@/Repositories/QuizAttemptRepository";

export type LearnerActivity = {
  id: string;
  type: "lesson_completed" | "quiz_attempted";
  text: string;
  course: string;
  createdAt: Date;
};

export class LearnerDashboardService {
  constructor(
    private readonly progressRepository = new ProgressRepository(),
    private readonly quizAttemptRepository = new QuizAttemptRepository(),
  ) {}

  async getRecentActivity(
    userId: string,
    limit = 10,
  ): Promise<LearnerActivity[]> {
    const [lessonActivities, quizActivities] =
      await Promise.all([
        this.progressRepository.findRecentByUser(userId, limit),
        this.quizAttemptRepository.findRecentByUser(userId, limit),
      ]);

    const activities: LearnerActivity[] = [
      ...lessonActivities.map((activity) => ({
        id: `lesson-${activity.id}`,
        type: "lesson_completed" as const,
        text: `Completed "${activity.lesson.title}"`,
        course: activity.lesson.module.course.title,
        createdAt: activity.completedAt,
      })),

      ...quizActivities.map((activity) => {
        const course =
          activity.quiz.module?.course ??
          activity.quiz.course;

        const quizLabel =
          activity.quiz.type === "FINAL"
            ? "Final assessment"
            : `${activity.quiz.module?.title ?? "Module"} quiz`;

        return {
          id: `quiz-${activity.id}`,
          type: "quiz_attempted" as const,
          text: `Attempted ${quizLabel} (${activity.score}%)`,
          course: course?.title ?? "Unknown course",
          createdAt: activity.attemptedAt,
        };
      }),
    ];

    return activities
      .sort(
        (a, b) =>
          b.createdAt.getTime() -
          a.createdAt.getTime(),
      )
      .slice(0, limit);
  }
}
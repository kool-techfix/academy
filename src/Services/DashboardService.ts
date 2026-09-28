import { ProgressRepository } from "@/Repositories/ProgressRepository";
import { QuizAttemptRepository } from "@/Repositories/QuizAttemptRepository";

export type LearnerActivity = {
  id: string;
  type: "lesson_completed" | "quiz_attempted";
  text: string;
  course: string;
  createdAt: Date;
};

export type LearnerStreak = {
  currentStreak: number;
  activeDays: string[];
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
    const [lessonActivities, quizActivities] = await Promise.all([
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
        const course = activity.quiz.module?.course ?? activity.quiz.course;

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
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getStreak(userId: string): Promise<LearnerStreak> {
    const since = new Date();

    since.setDate(since.getDate() - 60);

    const [lessonActivities, quizActivities] = await Promise.all([
      this.progressRepository.findActivityDates(userId, since),
      this.quizAttemptRepository.findActivityDates(userId, since),
    ]);

    const activityDates = new Set<string>();

    for (const activity of lessonActivities) {
      activityDates.add(activity.completedAt.toISOString().slice(0, 10));
    }

    for (const activity of quizActivities) {
      activityDates.add(activity.attemptedAt.toISOString().slice(0, 10));
    }

    const today = new Date();

    const todayKey = today.toISOString().slice(0, 10);

    const yesterday = new Date(today);

    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    let currentStreak = 0;

    let cursor = activityDates.has(todayKey)
      ? today
      : activityDates.has(yesterdayKey)
        ? yesterday
        : null;

    while (cursor) {
      const key = cursor.toISOString().slice(0, 10);

      if (!activityDates.has(key)) {
        break;
      }

      currentStreak += 1;

      const previousDay = new Date(cursor);

      previousDay.setDate(previousDay.getDate() - 1);

      cursor = previousDay;
    }

    return {
      currentStreak,
      activeDays: Array.from(activityDates),
    };
  }
}

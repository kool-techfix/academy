import { api } from "@/lib/api/axios";

export type LearnerActivityType =
  | "lesson_completed"
  | "quiz_attempted";

export type LearnerActivity = {
  id: string;
  type: LearnerActivityType;
  text: string;
  course: string;
  createdAt: string;
};

type LearnerActivityResponse = {
  data: LearnerActivity[];
};

export const learnerDashboardApi = {
  async getRecentActivity(): Promise<LearnerActivity[]> {
    const response =
      await api.get<LearnerActivityResponse>(
        "/learner/dashboard/activity",
      );

    return response.data.data;
  },
};
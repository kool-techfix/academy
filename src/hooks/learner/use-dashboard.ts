"use client";

import { useQuery } from "@tanstack/react-query";

import { learnerDashboardApi } from "@/Services/dashboard.service";

export const LEARNER_DASHBOARD_ACTIVITY_QUERY_KEY = [
  "learner",
  "dashboard",
  "activity",
] as const;

export function useLearnerRecentActivity() {
  return useQuery({
    queryKey: LEARNER_DASHBOARD_ACTIVITY_QUERY_KEY,
    queryFn: learnerDashboardApi.getRecentActivity,
    staleTime: 60 * 1000,
  });
}
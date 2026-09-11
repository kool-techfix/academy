import { NextResponse } from "next/server";

import { requireLearner } from "@/lib/auth/auth-guard";
import { LearnerDashboardService } from "@/Services/DashboardService";

const dashboardService = new LearnerDashboardService();

export async function GET() {
  try {
    const user = await requireLearner();

    const activity =
      await dashboardService.getRecentActivity(user.id);

    return NextResponse.json({
      data: activity,
    });
  } catch (error) {
    console.error(
      "GET /api/learner/dashboard/activity error:",
      error,
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to load learner activity",
      },
      { status: 500 },
    );
  }
}
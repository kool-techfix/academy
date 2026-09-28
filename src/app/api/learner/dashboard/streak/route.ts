import { NextResponse } from "next/server";

import { requireLearner } from "@/lib/auth/auth-guard";
import { LearnerDashboardService } from "@/Services/DashboardService";

const dashboardService = new LearnerDashboardService();

export async function GET() {
  try {
    const user = await requireLearner();

    const streak = await dashboardService.getStreak(user.id);

    return NextResponse.json({
      data: streak,
    });
  } catch (error) {
    console.error("GET /api/learner/dashboard/streak error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to load learner streak",
      },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";

import { requireLearner } from "@/lib/auth/auth-guard";
import { LearnerProgressService } from "@/Services/ProgressService";

export async function GET() {
  try {
    const user = await requireLearner();

    const progressService =
      new LearnerProgressService();

    const progress =
      await progressService.getAllCourseProgress(
        user.id,
      );

    return NextResponse.json({
      data: progress,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Unauthorized"
    ) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "Forbidden"
    ) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 },
      );
    }

    console.error(
      "GET /api/learner/progress error:",
      error,
    );

    return NextResponse.json(
      { message: "Failed to fetch course progress" },
      { status: 500 },
    );
  }
}
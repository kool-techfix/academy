import { NextResponse } from "next/server";

import { LearnerProgressService } from "@/Services/ProgressService";
import { requireLearner } from "@/lib/auth/auth-guard";

const progressService = new LearnerProgressService();

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ courseId: string }>;
  },
) {
  try {
    const learner = await requireLearner();

    const { courseId } = await params;

    const progress =
      await progressService.getCourseProgress(
        learner.id,
        courseId,
      );

    return NextResponse.json({
      data: progress,
    });
  } catch (error) {
    console.error(
      "GET /api/learner/progress/[courseId] error:",
      error,
    );

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

    if (
      error instanceof Error &&
      error.message === "Course not found"
    ) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Failed to fetch course progress",
      },
      { status: 500 },
    );
  }
}
import { NextResponse } from "next/server";

import { requireLearner } from "@/lib/auth/auth-guard";
import { LearnerProgressService } from "@/Services/ProgressService";

const learnerProgressService = new LearnerProgressService();

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ courseId: string }>;
  },
) {
  try {
    const user = await requireLearner();

    const { courseId } = await params;

    const progress =
      await learnerProgressService.getCourseProgress(
        user.id,
        courseId,
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

    if (
      error instanceof Error &&
      error.message === "Course not found"
    ) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 },
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "You are not enrolled in this course"
    ) {
      return NextResponse.json(
        {
          message: "You are not enrolled in this course",
        },
        { status: 403 },
      );
    }

    console.error(
      "Failed to get learner course progress:",
      error,
    );

    return NextResponse.json(
      { message: "Failed to get course progress" },
      { status: 500 },
    );
  }
}
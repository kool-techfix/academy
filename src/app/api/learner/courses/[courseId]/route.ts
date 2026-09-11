import { NextResponse } from "next/server";

import { LearnerCourseService } from "@/Services/LearnerCourseService";
import { requireLearner } from "@/lib/auth/auth-guard";

const learnerCourseService = new LearnerCourseService();

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

    const course =
      await learnerCourseService.getCourse(
        learner.id,
        courseId,
      );

    return NextResponse.json({
      data: course,
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

    if (
      error instanceof Error &&
      error.message === "Course not found"
    ) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 },
      );
    }

    console.error(
      "GET /api/learner/courses/[courseId] error:",
      error,
    );

    return NextResponse.json(
      {
        message: "Failed to fetch learner course",
      },
      { status: 500 },
    );
  }
}
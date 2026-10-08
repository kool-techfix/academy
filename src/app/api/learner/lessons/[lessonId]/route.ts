import { learnerAccessErrorStatus } from "@/lib/learner-access";
import { NextResponse } from "next/server";

import { LearnerLessonService } from "@/Services/LearnerLessonService";
import { requireLearner } from "@/lib/auth/auth-guard";

const lessonService =
  new LearnerLessonService();

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ lessonId: string }>;
  },
) {
  try {
    const learner = await requireLearner();

    const { lessonId } = await params;

    const lesson =
      await lessonService.getLesson(
        learner.id,
        lessonId,
      );

    return NextResponse.json({
      data: lesson,
    });
  } catch (error) {
    const accessStatus = learnerAccessErrorStatus(error);

    if (accessStatus) {
      return NextResponse.json(
        { message: (error as Error).message },
        { status: accessStatus },
      );
    }

    console.error(
      "GET /api/learner/lessons/[lessonId] error:",
      error,
    );

    if (
      error instanceof Error &&
      error.message === "Unauthorized"
    ) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "Forbidden"
    ) {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        { status: 403 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "Lesson not found"
    ) {
      return NextResponse.json(
        {
          message: "Lesson not found",
        },
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
          message: error.message,
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        message: "Failed to fetch lesson",
      },
      { status: 500 },
    );
  }
}
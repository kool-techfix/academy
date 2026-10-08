import { NextResponse } from "next/server";

import { requireLearner } from "@/lib/auth/auth-guard";
import { learnerAccessErrorStatus } from "@/lib/learner-access";
import { LearnerProgressService } from "@/Services/ProgressService";

const progressService = new LearnerProgressService();

/**
 * Restart a course after failing a final assessment that doesn't allow
 * retakes: clears the learner's attempts and lesson progress for it.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const learner = await requireLearner();

    const { courseId } = await params;

    const progress = await progressService.restartCourse(learner.id, courseId);

    return NextResponse.json({
      message: "Course restarted",
      data: progress,
    });
  } catch (error) {
    const accessStatus = learnerAccessErrorStatus(error);

    if (accessStatus) {
      return NextResponse.json(
        { message: (error as Error).message },
        { status: accessStatus },
      );
    }

    console.error("POST /api/learner/courses/[courseId]/restart error:", error);

    const message = error instanceof Error ? error.message : "";
    const status =
      message === "Unauthorized"
        ? 401
        : message === "Forbidden"
          ? 403
          : message === "Course not found"
            ? 404
            : 500;

    return NextResponse.json(
      {
        message:
          status === 500 ? "Failed to restart the course" : message,
      },
      { status },
    );
  }
}

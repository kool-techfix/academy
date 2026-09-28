import { NextResponse } from "next/server";

import { requireLearner } from "@/lib/auth/auth-guard";
import { LearnerQuizService } from "@/Services/LearnerQuizService";

const quizService = new LearnerQuizService();

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

    const quiz = await quizService.getFinalQuiz(user.id, courseId);

    return NextResponse.json({
      data: quiz,
    });
  } catch (error) {
    console.error(
      "GET /api/learner/courses/[courseId]/final-quiz error:",
      error,
    );

    const message =
      error instanceof Error ? error.message : "Failed to load final quiz";

    const status =
      message === "You are not enrolled in this course"
        ? 403
        : message === "Course not found" || message === "Final quiz not found"
          ? 404
          : message.includes("complete all module quizzes")
            ? 403
            : 500;

    return NextResponse.json({ message }, { status });
  }
}

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ courseId: string }>;
  },
) {
  try {
    const user = await requireLearner();
    const { courseId } = await params;

    const body = await request.json();

    const result = await quizService.submitFinalQuiz(user.id, courseId, body);

    return NextResponse.json({
      data: result,
    });
  } catch (error) {
    console.error(
      "POST /api/learner/courses/[courseId]/final-quiz error:",
      error,
    );

    const message =
      error instanceof Error ? error.message : "Failed to submit final quiz";

    const status =
      message === "You are not enrolled in this course"
        ? 403
        : message === "Course not found" || message === "Quiz not found"
          ? 404
          : message.includes("complete all module quizzes") ||
              message === "This quiz is not a final quiz" ||
              message === "Quiz does not belong to this course"
            ? 403
            : 400;

    return NextResponse.json({ message }, { status });
  }
}

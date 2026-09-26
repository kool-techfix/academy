import { NextResponse } from "next/server";

import { LearnerQuizService, SubmitQuizData } from "@/Services/LearnerQuizService";
import { requireLearner } from "@/lib/auth/auth-guard";

const learnerQuizService = new LearnerQuizService();

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      courseId: string;
      moduleId: string;
    }>;
  },
) {
  try {
    const learner = await requireLearner();

    const { courseId, moduleId } = await params;

    const quiz =
      await learnerQuizService.getModuleQuiz(
        learner.id,
        courseId,
        moduleId,
      );

    return NextResponse.json({
      data: quiz,
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
          message:
            "You are not enrolled in this course",
        },
        { status: 403 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "Quiz not found"
    ) {
      return NextResponse.json(
        { message: "Quiz not found" },
        { status: 404 },
      );
    }

    console.error(
      "GET learner module quiz error:",
      error,
    );

    return NextResponse.json(
      {
        message: "Failed to fetch quiz",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      courseId: string;
      moduleId: string;
    }>;
  },
) {
  try {
    const user = await requireLearner();

    const { courseId, moduleId } = await context.params;

    const body = (await request.json()) as SubmitQuizData;

    const result =
      await learnerQuizService.submitModuleQuiz(
        user.id,
        courseId,
        moduleId,
        body,
      );

    return NextResponse.json(
      {
        data: result,
        message: "Quiz submitted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to submit quiz";

    if (
      message ===
      "You are not enrolled in this course"
    ) {
      return NextResponse.json(
        { message },
        { status: 403 },
      );
    }

    if (
      message === "Quiz not found" ||
      message === "Lesson not found"
    ) {
      return NextResponse.json(
        { message },
        { status: 404 },
      );
    }

    if (
      message === "Quiz ID is required" ||
      message === "This quiz is not a module quiz" ||
      message === "Quiz does not belong to this module" ||
      message === "Quiz does not belong to this course" ||
      message === "Quiz has no questions" ||
      message === "All quiz questions must be answered" ||
      message === "Invalid question submitted" ||
      message ===
        "Duplicate question answers are not allowed"
    ) {
      return NextResponse.json(
        { message },
        { status: 400 },
      );
    }

    console.error(
      "POST /api/learner/courses/[courseId]/modules/[moduleId]/quiz:",
      error,
    );

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
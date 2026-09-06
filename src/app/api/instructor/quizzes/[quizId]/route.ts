import { NextRequest, NextResponse } from "next/server";

import { requireInstructor } from "@/lib/auth/auth-guard";
import {
  QuizService,
  type UpdateQuizData,
} from "@/Services/QuizService";

const quizService = new QuizService();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> },
) {
  try {
    await requireInstructor();

    const { quizId } = await params;

    const quiz = await quizService.getQuiz(quizId);

    return NextResponse.json({
      data: quiz,
    });
  } catch (error) {
    console.error("GET quiz error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to get quiz",
      },
      { status: 404 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> },
) {
  try {
    const instructor = await requireInstructor();

    const { quizId } = await params;

    const body =
      (await request.json()) as UpdateQuizData;

    const quiz = await quizService.updateQuiz(
      instructor.id,
      quizId,
      body,
    );

    return NextResponse.json({
      data: quiz,
    });
  } catch (error) {
    console.error("PATCH quiz error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to update quiz",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> },
) {
  try {
    const instructor = await requireInstructor();

    const { quizId } = await params;

    await quizService.deleteQuiz(
      instructor.id,
      quizId,
    );

    return NextResponse.json({
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("DELETE quiz error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete quiz",
      },
      { status: 400 },
    );
  }
}
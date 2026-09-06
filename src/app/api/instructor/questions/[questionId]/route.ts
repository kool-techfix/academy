import { NextRequest, NextResponse } from "next/server";

import { requireInstructor } from "@/lib/auth/auth-guard";
import {
  QuizService,
  type QuizQuestionData,
} from "@/Services/QuizService";

const quizService = new QuizService();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> },
) {
  try {
    const instructor = await requireInstructor();

    const { questionId } = await params;

    const body =
      (await request.json()) as QuizQuestionData;

    const question =
      await quizService.updateQuestion(
        instructor.id,
        questionId,
        body,
      );

    return NextResponse.json({
      data: question,
    });
  } catch (error) {
    console.error("PATCH question error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to update question",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> },
) {
  try {
    const instructor = await requireInstructor();

    const { questionId } = await params;

    await quizService.deleteQuestion(
      instructor.id,
      questionId,
    );

    return NextResponse.json({
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("DELETE question error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete question",
      },
      { status: 400 },
    );
  }
}
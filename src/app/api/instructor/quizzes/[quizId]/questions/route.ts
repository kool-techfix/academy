import { NextRequest, NextResponse } from "next/server";

import { requireInstructor } from "@/lib/auth/auth-guard";
import {
  QuizService,
  type QuizQuestionData,
} from "@/Services/QuizService";

const quizService = new QuizService();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> },
) {
  try {
    const instructor = await requireInstructor();

    const { quizId } = await params;

    const body =
      (await request.json()) as QuizQuestionData;

    const question = await quizService.addQuestion(
      instructor.id,
      quizId,
      body,
    );

    return NextResponse.json(
      {
        data: question,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST question error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to create question",
      },
      { status: 400 },
    );
  }
}
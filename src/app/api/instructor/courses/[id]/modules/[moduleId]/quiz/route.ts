import { NextRequest, NextResponse } from "next/server";

import { requireInstructor } from "@/lib/auth/auth-guard";
import { lessonErrorStatus } from "@/lib/storage/errors";
import {
  QuizService,
  type CreateQuizData,
} from "@/Services/QuizService";

const quizService = new QuizService();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> },
) {
  try {
    const instructor = await requireInstructor();

    const { id, moduleId } = await params;

    const quiz = await quizService.getModuleQuiz(instructor.id, id, moduleId);

    return NextResponse.json({
      data: quiz,
    });
  } catch (error) {
    console.error("GET module quiz error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to get module quiz";

    return NextResponse.json(
      { message },
      { status: lessonErrorStatus(message) },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  try {
    const instructor = await requireInstructor();

    const { moduleId } = await params;

    const body =
      (await request.json()) as CreateQuizData;

    const quiz = await quizService.createModuleQuiz(
      instructor.id,
      moduleId,
      body,
    );

    return NextResponse.json(
      {
        data: quiz,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST module quiz error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to create module quiz",
      },
      { status: 400 },
    );
  }
}
import { NextRequest, NextResponse } from "next/server";

import { requireInstructor } from "@/lib/auth/auth-guard";
import { lessonErrorStatus } from "@/lib/storage/errors";
import { QuizService, type CreateQuizData } from "@/Services/QuizService";

const quizService = new QuizService();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const instructor = await requireInstructor();

    const { id: courseId } = await params;

    const quiz = await quizService.getCourseQuiz(instructor.id, courseId);

    return NextResponse.json({
      data: quiz,
    });
  } catch (error) {
    console.error("GET course quiz error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to get course quiz";

    return NextResponse.json(
      { message },
      { status: lessonErrorStatus(message) },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const instructor = await requireInstructor();

    const { id: courseId } = await params;

    const body = (await request.json()) as CreateQuizData;

    const quiz = await quizService.createFinalQuiz(
      instructor.id,
      courseId,
      body,
    );

    return NextResponse.json(
      {
        data: quiz,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST course quiz error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to create final quiz",
      },
      { status: 400 },
    );
  }
}

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
    console.error("GET final assessment error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to fetch final assessment";

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
        message: "Final assessment created successfully",
        data: quiz,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST final assessment error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create final assessment";

    let status = 500;

    if (
      message === "Final quiz must have type FINAL" ||
      message === "This course already has a final quiz" ||
      message === "Pass score must be an integer between 0 and 100" ||
      message === "Question text is required" ||
      message === "A question must have at least two options" ||
      message === "Question options cannot be empty" ||
      message ===
        "Correct answer must match one of the question options"
    ) {
      status = 400;
    }

    if (
      message ===
      "You do not have permission to manage this quiz"
    ) {
      status = 403;
    }

    return NextResponse.json(
      { message },
      { status },
    );
  }
}
import { NextRequest, NextResponse } from "next/server";

import { requireInstructor } from "@/lib/auth/auth-guard";
import {
  LessonService,
  type CreateLessonData,
} from "@/Services/LessonService";

const lessonService = new LessonService();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  try {
    await requireInstructor();

    const { moduleId } = await params;

    const lessons =
      await lessonService.getLessonsByModule(moduleId);

    return NextResponse.json({
      data: lessons,
    });
  } catch (error) {
    console.error("GET lessons error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch lessons";

    const status =
      message === "Module not found" ? 404 : 500;

    return NextResponse.json(
      { message },
      { status },
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
      (await request.json()) as CreateLessonData;

    const lesson =
      await lessonService.createLesson(
        instructor.id,
        moduleId,
        body,
      );

    return NextResponse.json(
      {
        message: "Lesson created successfully",
        data: lesson,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST lesson error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create lesson";

    let status = 500;

    if (message === "Module not found") {
      status = 404;
    }

    if (
      message === "Lesson title is required" ||
      message === "YouTube video ID is required"
    ) {
      status = 400;
    }

    if (
      message ===
      "You do not have permission to manage this lesson"
    ) {
      status = 403;
    }

    return NextResponse.json(
      { message },
      { status },
    );
  }
}
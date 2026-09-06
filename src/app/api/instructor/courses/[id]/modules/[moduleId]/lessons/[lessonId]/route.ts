import { NextRequest, NextResponse } from "next/server";

import { requireInstructor } from "@/lib/auth/auth-guard";
import { LessonService, type UpdateLessonData } from "@/Services/LessonService";

const lessonService = new LessonService();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  try {
    await requireInstructor();

    const { lessonId } = await params;

    const lesson = await lessonService.getLesson(lessonId);

    return NextResponse.json({
      data: lesson,
    });
  } catch (error) {
    console.error("GET lesson error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to fetch lesson";

    const status = message === "Lesson not found" ? 404 : 500;

    return NextResponse.json({ message }, { status });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  try {
    const instructor = await requireInstructor();

    const { lessonId } = await params;

    const body = (await request.json()) as UpdateLessonData;

    const lesson = await lessonService.updateLesson(
      instructor.id,
      lessonId,
      body,
    );

    return NextResponse.json({
      message: "Lesson updated successfully",
      data: lesson,
    });
  } catch (error) {
    console.error("PATCH lesson error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to update lesson";

    let status = 500;

    if (message === "Lesson not found") {
      status = 404;
    }

    if (
      message === "Lesson title is required" ||
      message === "YouTube video ID is required"
    ) {
      status = 400;
    }

    if (message === "You do not have permission to manage this lesson") {
      status = 403;
    }

    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  try {
    const instructor = await requireInstructor();

    const { lessonId } = await params;

    await lessonService.deleteLesson(instructor.id, lessonId);

    return NextResponse.json({
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    console.error("DELETE lesson error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to delete lesson";

    const status =
      message === "Lesson not found"
        ? 404
        : message === "You do not have permission to manage this lesson"
          ? 403
          : 500;

    return NextResponse.json({ message }, { status });
  }
}

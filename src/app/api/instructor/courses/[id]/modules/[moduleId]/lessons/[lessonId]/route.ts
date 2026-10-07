import { NextRequest, NextResponse } from "next/server";

import { requireInstructor } from "@/lib/auth/auth-guard";
import { lessonErrorStatus } from "@/lib/storage/errors";
import { lessonAttachmentsSchema } from "@/Schemas/lesson-attachment.schema";
import { LessonService, type UpdateLessonData } from "@/Services/LessonService";

const lessonService = new LessonService();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> },
) {
  try {
    const instructor = await requireInstructor();

    const { id, lessonId } = await params;

    const lesson = await lessonService.getLesson(instructor.id, id, lessonId);

    return NextResponse.json({
      data: lesson,
    });
  } catch (error) {
    console.error("GET lesson error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to fetch lesson";

    return NextResponse.json(
      { message },
      { status: lessonErrorStatus(message) },
    );
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

    const attachments = lessonAttachmentsSchema.safeParse(body.attachments);

    if (!attachments.success) {
      return NextResponse.json(
        { message: attachments.error.issues[0]?.message ?? "Invalid attachment" },
        { status: 400 },
      );
    }

    const lesson = await lessonService.updateLesson(
      instructor.id,
      lessonId,
      { ...body, attachments: attachments.data },
    );

    return NextResponse.json({
      message: "Lesson updated successfully",
      data: lesson,
    });
  } catch (error) {
    console.error("PATCH lesson error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to update lesson";

    return NextResponse.json(
      { message },
      { status: lessonErrorStatus(message) },
    );
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

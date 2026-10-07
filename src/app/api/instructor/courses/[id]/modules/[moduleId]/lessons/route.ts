import { NextRequest, NextResponse } from "next/server";

import { requireInstructor } from "@/lib/auth/auth-guard";
import { lessonErrorStatus } from "@/lib/storage/errors";
import { lessonAttachmentsSchema } from "@/Schemas/lesson-attachment.schema";
import {
  LessonService,
  type CreateLessonData,
} from "@/Services/LessonService";

const lessonService = new LessonService();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> },
) {
  try {
    const instructor = await requireInstructor();

    const { id, moduleId } = await params;

    const lessons =
      await lessonService.getLessonsByModule(instructor.id, id, moduleId);

    return NextResponse.json({
      data: lessons,
    });
  } catch (error) {
    console.error("GET lessons error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch lessons";

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
      (await request.json()) as CreateLessonData;

    const attachments = lessonAttachmentsSchema.safeParse(body.attachments);

    if (!attachments.success) {
      return NextResponse.json(
        { message: attachments.error.issues[0]?.message ?? "Invalid attachment" },
        { status: 400 },
      );
    }

    const lesson =
      await lessonService.createLesson(
        instructor.id,
        moduleId,
        { ...body, attachments: attachments.data },
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

    return NextResponse.json(
      { message },
      { status: lessonErrorStatus(message) },
    );
  }
}
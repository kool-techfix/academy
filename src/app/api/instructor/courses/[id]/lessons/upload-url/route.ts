import { NextRequest, NextResponse } from "next/server";

import { requireInstructor } from "@/lib/auth/auth-guard";
import { lessonErrorStatus } from "@/lib/storage/errors";
import { attachmentUploadUrlSchema } from "@/Schemas/lesson-attachment.schema";
import { LessonService } from "@/Services/LessonService";

const lessonService = new LessonService();

/**
 * Presigned URL for uploading one lesson attachment straight to R2.
 * Body: { filename, contentType, size, lessonId? }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const instructor = await requireInstructor();

    const { id: courseId } = await params;

    const parsed = attachmentUploadUrlSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 },
      );
    }

    const data = await lessonService.createAttachmentUploadUrl(
      instructor.id,
      courseId,
      parsed.data,
    );

    return NextResponse.json({ data });
  } catch (error) {
    console.error("POST lesson attachment upload-url error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to prepare upload";

    return NextResponse.json(
      { message },
      { status: lessonErrorStatus(message) },
    );
  }
}

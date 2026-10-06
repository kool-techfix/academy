import { NextRequest, NextResponse } from "next/server";

import { requireInstructor } from "@/lib/auth/auth-guard";
import { lessonErrorStatus } from "@/lib/storage/errors";
import { LessonService } from "@/Services/LessonService";

const lessonService = new LessonService();

export async function DELETE(
  _request: NextRequest,
  {
    params,
  }: { params: Promise<{ lessonId: string; attachmentId: string }> },
) {
  try {
    const instructor = await requireInstructor();

    const { lessonId, attachmentId } = await params;

    await lessonService.removeAttachment(instructor.id, lessonId, attachmentId);

    return NextResponse.json({
      message: "Attachment deleted successfully",
    });
  } catch (error) {
    console.error("DELETE lesson attachment error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to delete attachment";

    return NextResponse.json(
      { message },
      { status: lessonErrorStatus(message) },
    );
  }
}

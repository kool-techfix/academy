import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/auth-guard";
import { lessonErrorStatus } from "@/lib/storage/errors";
import { LessonService } from "@/Services/LessonService";

const lessonService = new LessonService();

/**
 * Short-lived download URL for a lesson attachment. The service allows the
 * course's approved instructors and learners with an active or completed
 * enrollment; everyone else gets 403.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ attachmentId: string }> },
) {
  try {
    const user = await requireAuth();

    const { attachmentId } = await params;

    const data = await lessonService.getAttachmentDownloadUrl(
      user,
      attachmentId,
    );

    return NextResponse.json({ data });
  } catch (error) {
    console.error(
      "GET /api/learner/attachments/[attachmentId]/download error:",
      error,
    );

    const message =
      error instanceof Error ? error.message : "Failed to prepare download";

    return NextResponse.json(
      { message },
      { status: lessonErrorStatus(message) },
    );
  }
}

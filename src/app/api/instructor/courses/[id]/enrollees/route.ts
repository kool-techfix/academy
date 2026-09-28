import { NextResponse } from "next/server";

import { EnrollmentService } from "@/Services/EnrollmentService";
import { getCurrentUser, requireInstructor } from "@/lib/auth/auth-guard";

const enrollmentService = new EnrollmentService();

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    await requireInstructor();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;

    const data = await enrollmentService.getCourseEnrollees(courseId, user.id);

    return NextResponse.json(
      {
        data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to get course enrollees:", error);

    const message =
      error instanceof Error ? error.message : "Failed to get course enrollees";

    if (message === "Course not found") {
      return NextResponse.json({ message }, { status: 404 });
    }

    if (message === "You do not have access to this course") {
      return NextResponse.json({ message }, { status: 403 });
    }

    return NextResponse.json(
      {
        message: "Failed to get course enrollees",
      },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";

import { requireInstructor } from "@/lib/auth/auth-guard";
import { CourseService } from "@/Services/CourseService";

const courseService = new CourseService();

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  _request: Request,
  context: RouteContext,
) {
  try {
    const instructor = await requireInstructor();

    const { id } = await context.params;

    const course = await courseService.unpublishCourse(
      instructor.id,
      id,
    );

    return NextResponse.json({
      message: "Course unpublished successfully",
      data: course,
    });
  } catch (error) {
    console.error(
      "UNPUBLISH instructor course error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to unpublish course";

    const status =
      message === "Unauthorized"
        ? 401
        : message === "Forbidden"
          ? 403
          : message === "Course not found"
            ? 404
            : message.includes("permission")
              ? 403
              : message.includes("already")
                ? 409
                : 500;

    return NextResponse.json(
      { message },
      { status },
    );
  }
}
import { COURSE_HAS_LEARNERS } from "@/lib/storage/errors";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { requireInstructor } from "@/lib/auth/auth-guard";
import { CourseService } from "@/Services/CourseService";
import { updateCourseSchema } from "@/Schemas/course.schema";

const courseService = new CourseService();

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const instructor = await requireInstructor();

    const { id } = await context.params;

    const course = await courseService.getCourseById(instructor.id, id);

    return NextResponse.json({
      data: course,
    });
  } catch (error) {
    console.error("GET instructor course error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to fetch course";

    const status =
      message === "Unauthorized"
        ? 401
        : message === "Forbidden"
          ? 403
          : message === "Course not found"
            ? 404
            : message.includes("permission")
              ? 403
              : 500;

    return NextResponse.json({ message }, { status });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const instructor = await requireInstructor();

    const { id } = await context.params;

    const body = await request.json();

    const validatedData = updateCourseSchema.parse(body);

    const course = await courseService.updateCourse(
      instructor.id,
      id,
      validatedData,
    );

    return NextResponse.json({
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    console.error("UPDATE instructor course error:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to update course";

    const status =
      message === "Unauthorized"
        ? 401
        : message === "Forbidden"
          ? 403
          : message.includes("permission")
            ? 403
            : message === "Course not found"
              ? 404
              : 500;

    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const instructor = await requireInstructor();

    const { id } = await context.params;

    await courseService.deleteCourse(instructor.id, id);

    return NextResponse.json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("DELETE instructor course error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to delete course";

    const status =
      message === COURSE_HAS_LEARNERS
        ? 409
        : message === "Unauthorized"
          ? 401
          : message === "Forbidden"
            ? 403
            : message.includes("permission")
              ? 403
              : 500;

    return NextResponse.json({ message }, { status });
  }
}

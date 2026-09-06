import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireInstructor } from "@/lib/auth/auth-guard";
import { CourseService } from "@/Services/CourseService";
import { createCourseSchema } from "@/Schemas/course.schema";

const courseService = new CourseService();

export async function GET() {
  try {
    const instructor = await requireInstructor();

    const courses = await courseService.getInstructorCourses(instructor.id);

    return NextResponse.json({
      data: courses,
    });
  } catch (error) {
    console.error("GET instructor courses error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to fetch courses";

    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const instructor = await requireInstructor();

    const body = await request.json();

    const validatedData = createCourseSchema.parse(body);

    const course = await courseService.createCourse(
      instructor.id,
      validatedData,
    );

    return NextResponse.json(
      {
        message: "Course created successfully",
        data: course,
      },
      { status: 201 },
    );
  } catch (error) {
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
      error instanceof Error ? error.message : "Failed to create course";

    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}

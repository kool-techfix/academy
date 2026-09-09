import { NextResponse } from "next/server";

import { EnrollmentService } from "@/Services/EnrollmentService";
import { requireLearner } from "@/lib/auth/auth-guard";
import { createEnrollmentSchema } from "@/Schemas/enrollment.schema";

const enrollmentService = new EnrollmentService();

export async function GET() {
  try {
    const learner = await requireLearner();

    const enrollments = await enrollmentService.getLearnerEnrollments(
      learner.id,
    );

    return NextResponse.json({
      data: enrollments,
    });
  } catch (error) {
    console.error("GET /api/learner/enrollments error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        message: "Failed to fetch enrollments",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const learner = await requireLearner();

    const body = await request.json();

    const { courseId } = createEnrollmentSchema.parse(body);

    const enrollment = await enrollmentService.enroll(learner.id, courseId);

    return NextResponse.json(
      {
        data: enrollment,
        message: "Successfully enrolled in course",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/learner/enrollments error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        { status: 403 },
      );
    }

    if (error instanceof Error) {
      if (
        error.message === "Course not found or not available for enrollment"
      ) {
        return NextResponse.json(
          {
            message: error.message,
          },
          { status: 404 },
        );
      }

      if (error.message === "You are already enrolled in this course") {
        return NextResponse.json(
          {
            message: error.message,
          },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      {
        message: "Failed to enroll in course",
      },
      { status: 500 },
    );
  }
}

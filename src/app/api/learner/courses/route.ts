/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextResponse } from "next/server";

import { requireLearner } from "@/lib/auth/auth-guard";
import { LearnerCourseService } from "@/Services/LearnerCourseService";

const learnerCourseService =
  new LearnerCourseService();

export async function GET() {
  try {
    const user = await requireLearner();

    const courses =
      await learnerCourseService.getPublishedCourses();

    return NextResponse.json({
      data: courses,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch courses";

    if (
      message === "Unauthorized" ||
      message === "Authentication required"
    ) {
      return NextResponse.json(
        { message },
        { status: 401 },
      );
    }

    if (
      message === "Forbidden" ||
      message === "Learner access required"
    ) {
      return NextResponse.json(
        { message },
        { status: 403 },
      );
    }

    console.error(
      "GET /api/learner/courses:",
      error,
    );

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
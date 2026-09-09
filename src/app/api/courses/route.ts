import { NextResponse } from "next/server";

import { PublicCourseService } from "@/Services/PublicCourseService";

const publicCourseService = new PublicCourseService();

export async function GET() {
  try {
    const courses = await publicCourseService.getPublishedCourses();

    return NextResponse.json({
      data: courses,
    });
  } catch (error) {
    console.error("GET public courses error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch courses";

    return NextResponse.json(
      { message },
      { status: 500 },
    );
  }
}
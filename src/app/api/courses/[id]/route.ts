import { NextResponse } from "next/server";

import { PublicCourseService } from "@/Services/PublicCourseService";

const publicCourseService = new PublicCourseService();

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    const course =
      await publicCourseService.getPublishedCourseById(id);

    return NextResponse.json({
      data: course,
    });
  } catch (error) {
    console.error("GET public course error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch course";

    const status =
      message === "Course not found"
        ? 404
        : 500;

    return NextResponse.json(
      { message },
      { status },
    );
  }
}
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/auth-guard";
import { toErrorResponse } from "@/lib/server/route-error";
import { AdminCourseService } from "@/Services/AdminCourseService";

const adminCourseService = new AdminCourseService();

export async function GET() {
  try {
    await requireAdmin();

    const courses = await adminCourseService.getCourses();

    return NextResponse.json({ data: courses });
  } catch (error) {
    return toErrorResponse(error, "Failed to fetch courses");
  }
}

import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/auth-guard";
import { toErrorResponse } from "@/lib/server/route-error";
import { instructorStatusFilterSchema } from "@/Schemas/admin.schema";
import { AdminInstructorService } from "@/Services/AdminInstructorService";

const adminInstructorService = new AdminInstructorService();

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const status = instructorStatusFilterSchema.parse(
      new URL(request.url).searchParams.get("status") ?? undefined,
    );

    const instructors = await adminInstructorService.getInstructors(status);

    return NextResponse.json({ data: instructors });
  } catch (error) {
    return toErrorResponse(error, "Failed to fetch instructors");
  }
}

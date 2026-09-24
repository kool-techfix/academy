import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/auth-guard";
import { toErrorResponse } from "@/lib/server/route-error";
import { adminIdSchema } from "@/Schemas/admin.schema";
import { AdminCourseService } from "@/Services/AdminCourseService";

const adminCourseService = new AdminCourseService();

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();

    const id = adminIdSchema.parse((await context.params).id);

    const data = await adminCourseService.restore(id);

    return NextResponse.json({ message: "Course restored", data });
  } catch (error) {
    return toErrorResponse(error, "Failed to restore course");
  }
}

import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/auth-guard";
import { toErrorResponse } from "@/lib/server/route-error";
import { adminIdSchema, moderationReasonSchema } from "@/Schemas/admin.schema";
import { AdminCourseService } from "@/Services/AdminCourseService";

const adminCourseService = new AdminCourseService();

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();

    const id = adminIdSchema.parse((await context.params).id);
    const { reason } = moderationReasonSchema.parse(
      await request.json().catch(() => ({})),
    );

    const data = await adminCourseService.remove(id, reason);

    return NextResponse.json({ message: "Course removed", data });
  } catch (error) {
    return toErrorResponse(error, "Failed to remove course");
  }
}

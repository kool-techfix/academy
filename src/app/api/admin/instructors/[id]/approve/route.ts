import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/auth-guard";
import { toErrorResponse } from "@/lib/server/route-error";
import { adminIdSchema } from "@/Schemas/admin.schema";
import { AdminInstructorService } from "@/Services/AdminInstructorService";

const adminInstructorService = new AdminInstructorService();

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();

    const id = adminIdSchema.parse((await context.params).id);

    const { instructor, emailSent } = await adminInstructorService.approve(id);

    return NextResponse.json({
      message: "Instructor approved",
      data: instructor,
      emailSent,
    });
  } catch (error) {
    return toErrorResponse(error, "Failed to approve instructor");
  }
}

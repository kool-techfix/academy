import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/auth-guard";
import { toErrorResponse } from "@/lib/server/route-error";
import { adminIdSchema, moderationReasonSchema } from "@/Schemas/admin.schema";
import { AdminUserService } from "@/Services/AdminUserService";

const adminUserService = new AdminUserService();

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

    const data = await adminUserService.remove(id, reason);

    return NextResponse.json({ message: "User removed", data });
  } catch (error) {
    return toErrorResponse(error, "Failed to remove user");
  }
}

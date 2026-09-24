import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/auth-guard";
import { toErrorResponse } from "@/lib/server/route-error";
import { adminIdSchema } from "@/Schemas/admin.schema";
import { AdminUserService } from "@/Services/AdminUserService";

const adminUserService = new AdminUserService();

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();

    const id = adminIdSchema.parse((await context.params).id);

    const data = await adminUserService.reinstate(id);

    return NextResponse.json({ message: "User reinstated", data });
  } catch (error) {
    return toErrorResponse(error, "Failed to reinstate user");
  }
}

import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/auth-guard";
import { toErrorResponse } from "@/lib/server/route-error";
import { moderatedUserRoleSchema } from "@/Schemas/admin.schema";
import { AdminUserService } from "@/Services/AdminUserService";

const adminUserService = new AdminUserService();

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const role = moderatedUserRoleSchema.parse(
      new URL(request.url).searchParams.get("role") ?? undefined,
    );

    const users = await adminUserService.getUsers(role);

    return NextResponse.json({ data: users });
  } catch (error) {
    return toErrorResponse(error, "Failed to fetch users");
  }
}

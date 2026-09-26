import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/auth-guard";
import { toErrorResponse } from "@/lib/server/route-error";
import { AdminDashboardService } from "@/Services/AdminDashboardService";

const adminDashboardService = new AdminDashboardService();

export async function GET() {
  try {
    await requireAdmin();

    const counts = await adminDashboardService.getCounts();

    return NextResponse.json({ data: counts });
  } catch (error) {
    return toErrorResponse(error, "Failed to load admin dashboard");
  }
}

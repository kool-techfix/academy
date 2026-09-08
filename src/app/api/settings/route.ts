import { NextResponse } from "next/server";

import { AuthService } from "@/Services/AuthService";
import { requireAuth } from "@/lib/auth/auth-guard";

const authService = new AuthService();

export async function GET() {
  try {
    const user = await requireAuth();

    const settings = await authService.getUserSettings(user.id);

    return NextResponse.json({
      data: settings,
    });
  } catch (error) {
    console.error("GET settings error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to load settings";

    let status = 500;

    if (
      message === "Unauthorized" ||
      message === "Authentication required"
    ) {
      status = 401;
    }

    if (message === "User not found") {
      status = 404;
    }

    return NextResponse.json(
      { message },
      { status },
    );
  }
}
import { NextRequest, NextResponse } from "next/server";

import { AuthService } from "@/Services/AuthService";
import { requireAuth } from "@/lib/auth/auth-guard";

const authService = new AuthService();

export async function PATCH(
  request: NextRequest,
) {
  try {
    const user = await requireAuth();

    const body = await request.json();

    const {
      courseUpdatesNotification,
      learnerActivityNotification,
    } = body;

    if (
      courseUpdatesNotification !== undefined &&
      typeof courseUpdatesNotification !== "boolean"
    ) {
      return NextResponse.json(
        {
          message:
            "courseUpdatesNotification must be a boolean",
        },
        { status: 400 },
      );
    }

    if (
      learnerActivityNotification !== undefined &&
      typeof learnerActivityNotification !== "boolean"
    ) {
      return NextResponse.json(
        {
          message:
            "learnerActivityNotification must be a boolean",
        },
        { status: 400 },
      );
    }

    const updatedUser =
      await authService.updateNotifications(
        user.id,
        {
          courseUpdatesNotification,
          learnerActivityNotification,
        },
      );

    return NextResponse.json({
      message: "Notification settings updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error(
      "PATCH notifications error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update notification settings";

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

    if (
      message ===
      "No notification settings provided"
    ) {
      status = 400;
    }

    return NextResponse.json(
      { message },
      { status },
    );
  }
}
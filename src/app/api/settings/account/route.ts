import { NextRequest, NextResponse } from "next/server";

import { AuthService } from "@/Services/AuthService";
import { getSession, requireAuth } from "@/lib/auth/auth-guard";
import { tooManyRequests } from "@/lib/rate-limit";
import { AUTH_RATE_LIMITS, RateLimitService } from "@/Services/RateLimitService";

const authService = new AuthService();
const rateLimitService = new RateLimitService();

export async function PATCH(
  request: NextRequest,
) {
  try {
    const user = await requireAuth();

    const body = await request.json();

    const {
      email,
      currentPassword,
      newPassword,
    } = body;

    if (
      email !== undefined &&
      typeof email !== "string"
    ) {
      return NextResponse.json(
        {
          message: "Email must be a string",
        },
        { status: 400 },
      );
    }

    if (
      currentPassword !== undefined &&
      typeof currentPassword !== "string"
    ) {
      return NextResponse.json(
        {
          message: "Current password must be a string",
        },
        { status: 400 },
      );
    }

    if (
      newPassword !== undefined &&
      typeof newPassword !== "string"
    ) {
      return NextResponse.json(
        {
          message: "New password must be a string",
        },
        { status: 400 },
      );
    }

    // Each request that checks the current password counts, so a stolen
    // session can't be used to guess it.
    if (currentPassword) {
      const blocked = await rateLimitService.check([
        {
          key: `account-change:user:${user.id}`,
          ...AUTH_RATE_LIMITS.accountChangePerUser,
        },
      ]);

      if (blocked) {
        return tooManyRequests(blocked.retryAfter, "account change");
      }
    }

    const session = await getSession();

    const updatedUser =
      await authService.updateAccount(
        user.id,
        {
          email,
          currentPassword,
          newPassword,
        },
        session?.session.token,
      );

    return NextResponse.json({
      message: "Account updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error(
      "PATCH account error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update account";

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
      message === "Email is required" ||
      message ===
        "Enter your current password to change your email or password" ||
      message === "This account does not have a password" ||
      message ===
        "New password must be at least 8 characters" ||
      message === "No account changes provided"
    ) {
      status = 400;
    }

    if (
      message === "Current password is incorrect"
    ) {
      status = 401;
    }

    if (
      message ===
      "An account with this email already exists"
    ) {
      status = 409;
    }

    if (
      message ===
      "Google-managed accounts cannot update email or password here"
    ) {
      status = 403;
    }

    return NextResponse.json(
      { message },
      { status },
    );
  }
}
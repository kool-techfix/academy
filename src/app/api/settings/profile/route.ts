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

    const { name, certificateName, expertise } = body;

    const updatedUser =
      await authService.updateProfile(
        user.id,
        {
          name,
          certificateName,
          expertise,
        },
      );

    return NextResponse.json({
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error(
      "PATCH profile error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update profile";

    let status = 500;

    if (
      message === "Unauthorized" ||
      message === "Authentication required"
    ) {
      status = 401;
    }

    if (
      message === "Full name must be at least 2 characters" ||
      message === "Certificate name must be at least 2 characters"
    ) {
      status = 400;
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
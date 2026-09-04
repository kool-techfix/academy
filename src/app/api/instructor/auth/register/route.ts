import { NextResponse } from "next/server";

import { setSessionCookie } from "@/lib/auth/cookies";
import { AuthService } from "@/Services/AuthService";

const authService = new AuthService();

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      password,
      expertise,
    } = body;

    if (!name || !email || !password || !expertise) {
      return NextResponse.json(
        {
          message:
            "Name, email, password, and expertise are required",
        },
        { status: 400 },
      );
    }

    const user = await authService.registerInstructor({
      name,
      email,
      password,
      expertise,
    });

    await setSessionCookie(user.id, user.role);

    return NextResponse.json(
      {
        message:
          "Registration successful. Your instructor account is awaiting approval.",
        user,
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to register";

    return NextResponse.json(
      {
        message,
      },
      { status: 400 },
    );
  }
}
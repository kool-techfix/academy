import { NextResponse } from "next/server";

import { setSessionCookie } from "@/lib/auth/cookies";
import { AuthService } from "@/Services/AuthService";

const authService = new AuthService();

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          message: "Email and password are required",
        },
        { status: 400 },
      );
    }

    const user = await authService.login({
      email,
      password,
    });

    await setSessionCookie(user.id, user.role);

    return NextResponse.json(
      {
        message: "Login successful",
        user,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to login";

    return NextResponse.json(
      {
        message,
      },
      { status: 401 },
    );
  }
}
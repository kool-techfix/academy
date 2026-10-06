import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";
import { AuthRepository } from "@/Repositories/AuthRepository";
import { AuthService } from "@/Services/AuthService";

const authService = new AuthService();
const authRepository = new AuthRepository();

export async function POST(request: Request) {
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

  let token: string;

  try {
    // Verifies the password against the credential account and sets the
    // Better Auth session cookie (via the nextCookies plugin).
    const result = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });

    token = result.token;
  } catch {
    return NextResponse.json(
      { message: "Invalid email or password" },
      { status: 401 },
    );
  }

  try {
    const user = await authService.assertCanSignIn(email);

    return NextResponse.json(
      {
        message: "Login successful",
        user,
      },
      { status: 200 },
    );
  } catch (error) {
    // Suspended/removed: drop the session that was just created.
    await authRepository.deleteSessionByToken(token);

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

import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";
import { clientIp, tooManyRequests } from "@/lib/rate-limit";
import { AuthService } from "@/Services/AuthService";
import { AUTH_RATE_LIMITS, RateLimitService } from "@/Services/RateLimitService";

const authService = new AuthService();
const rateLimitService = new RateLimitService();

export async function POST(request: Request) {
  const blocked = await rateLimitService.check([
    {
      key: `register:ip:${clientIp(request.headers)}`,
      ...AUTH_RATE_LIMITS.registerPerIp,
    },
  ]);

  if (blocked) {
    return tooManyRequests(blocked.retryAfter, "sign-up");
  }

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

    // Start a Better Auth session for the new account.
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });

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
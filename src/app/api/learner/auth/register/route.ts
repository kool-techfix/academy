import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";
import { AuthService } from "@/Services/AuthService";

const authService = new AuthService();

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          message: "Name, email, and password are required",
        },
        { status: 400 },
      );
    }

    const user = await authService.registerLearner({
      name,
      email,
      password,
    });

    // Start a Better Auth session for the new account.
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });

    return NextResponse.json(
      {
        message: "Registration successful",
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
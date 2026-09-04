import { NextResponse } from "next/server";

import { clearSessionCookie } from "@/lib/auth/cookies";

export async function POST() {
  await clearSessionCookie();

  return NextResponse.json(
    {
      message: "Logout successful",
    },
    { status: 200 },
  );
}
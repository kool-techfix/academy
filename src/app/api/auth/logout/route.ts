import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";

export async function POST() {
  // Deletes the session row and clears the cookie.
  await auth.api.signOut({ headers: await headers() });

  return NextResponse.json(
    {
      message: "Logout successful",
    },
    { status: 200 },
  );
}

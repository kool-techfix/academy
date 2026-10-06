import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic gate: bounce visitors without a session cookie to /login before
 * rendering. It only checks that the cookie exists. The real checks (valid
 * session, role, instructor status) run in each section's server layout and
 * in every API route via requireLearner/requireInstructor/requireAdmin.
 */
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/courses/:path*",
    "/settings/:path*",
    "/instructor/:path*",
    "/instructor-application/:path*",
    "/instructor-status/:path*",
    "/admin/:path*",
  ],
};

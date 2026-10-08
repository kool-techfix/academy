import { NextResponse } from "next/server";

/**
 * Client IP for rate limiting. Vercel sets x-real-ip (and x-forwarded-for)
 * to the connecting client; prefer the single-value header.
 */
export function clientIp(headers: Headers) {
  const realIp = headers.get("x-real-ip")?.trim();
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  return realIp || forwarded || "unknown";
}

/** 429 with Retry-After and a readable wait time. */
export function tooManyRequests(retryAfter: number | null, action: string) {
  const seconds = retryAfter ?? 60;
  const minutes = Math.ceil(seconds / 60);
  const wait = minutes <= 1 ? "a minute" : `${minutes} minutes`;

  return NextResponse.json(
    { message: `Too many ${action} attempts. Please wait ${wait} and try again.` },
    { status: 429, headers: { "Retry-After": String(seconds) } },
  );
}

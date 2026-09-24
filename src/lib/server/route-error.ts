import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { HttpError } from "@/lib/server/http-error";

/**
 * Convert an error thrown by a guard, validator, or service into a JSON
 * response. Guard errors keep the existing "Unauthorized"/"Forbidden"
 * message convention used by requireAuth/requireAdmin.
 */
export function toErrorResponse(error: unknown, fallback: string) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        message: error.issues[0]?.message ?? "Validation failed",
        errors: error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  if (error instanceof HttpError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  if (error instanceof Error && error.message === "Unauthorized") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (error instanceof Error && error.message === "Forbidden") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  console.error(fallback, error);

  return NextResponse.json({ message: fallback }, { status: 500 });
}

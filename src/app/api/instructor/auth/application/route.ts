import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma/client";
import { instructorExpertiseSchema } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth/auth-guard";
import { AuthRepository } from "@/Repositories/AuthRepository";

const authRepository = new AuthRepository();

/**
 * Finishes an instructor sign-up that started with Google: the account
 * becomes an INSTRUCTOR with status PENDING. Only a Google sign-up that came
 * from the instructor form (flag set server-side at creation) may do this.
 * `{ continueAsLearner: true }` abandons the application and keeps the
 * account as a normal learner.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== Role.LEARNER || !user.instructorApplicationStarted) {
    return NextResponse.json(
      { message: "There is no instructor application to complete" },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => ({}));

  if (body?.continueAsLearner === true) {
    await authRepository.clearInstructorApplication(user.id);

    return NextResponse.json({ redirectTo: "/dashboard" }, { status: 200 });
  }

  const parsed = instructorExpertiseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message:
          parsed.error.issues[0]?.message ?? "Enter your area of expertise",
      },
      { status: 400 },
    );
  }

  const expertise = (
    parsed.data.expertise === "Other"
      ? parsed.data.otherExpertise
      : parsed.data.expertise
  )!.trim();

  await authRepository.submitInstructorApplication(user.id, expertise);

  return NextResponse.json(
    { redirectTo: "/instructor-status" },
    { status: 200 },
  );
}

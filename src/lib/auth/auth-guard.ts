import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AccountStatus, InstructorStatus, Role } from "@/generated/prisma/client";

import { homePathFor } from "@/lib/auth/redirects";
import { auth } from "@/lib/auth/server";
import { AuthRepository } from "@/Repositories/AuthRepository";

const authRepository = new AuthRepository();

/** The raw Better Auth session (validated against the session table). */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * The signed-in user with role and statuses, read fresh from the database,
 * or null. Use this in server components, layouts and route handlers.
 */
export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const user = await authRepository.findSafeById(session.user.id);

  // Suspended or removed accounts are treated as signed out everywhere,
  // even if they still hold a valid session cookie.
  if (!user || user.accountStatus !== AccountStatus.ACTIVE) {
    return null;
  }

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function requireLearner() {
  const user = await requireAuth();

  if (user.role !== Role.LEARNER) {
    throw new Error("Forbidden");
  }

  return user;
}

export async function requireInstructor() {
  const user = await requireAuth();

  if (user.role !== Role.INSTRUCTOR) {
    throw new Error("Forbidden");
  }

  if (user.instructorStatus !== InstructorStatus.APPROVED) {
    throw new Error("Instructor account is not approved");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== Role.ADMIN) {
    throw new Error("Forbidden");
  }

  return user;
}

type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/**
 * Server-side gate for a page or layout: signed-out visitors go to /login,
 * signed-in users who don't pass `isAllowed` go to their own home page.
 */
export async function guardPage(isAllowed: (user: CurrentUser) => boolean) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAllowed(user)) {
    redirect(homePathFor(user));
  }

  return user;
}

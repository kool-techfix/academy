import { AccountStatus, InstructorStatus, Role } from "@/generated/prisma/client";

import { getSession } from "@/lib/auth/session";
import { AuthRepository } from "@/Repositories/AuthRepository";

const authRepository = new AuthRepository();

export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const user = await authRepository.findSafeById(session.userId);

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

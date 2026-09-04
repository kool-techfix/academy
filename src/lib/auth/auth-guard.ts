import {
  InstructorStatus,
  Role,
} from "@/generated/prisma/client";

import { getSession } from "@/lib/auth/session";
import { AuthRepository } from "@/Repositories/AuthRepository";

const authRepository = new AuthRepository();

export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return authRepository.findSafeById(session.userId);
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
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
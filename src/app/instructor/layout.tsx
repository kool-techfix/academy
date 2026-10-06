import { guardPage } from "@/lib/auth/auth-guard";

/**
 * Instructor workspace: role INSTRUCTOR and status APPROVED. Pending,
 * rejected and suspended instructors are sent to /instructor-status.
 * Each /api/instructor route also calls requireInstructor().
 */
export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardPage(
    (user) =>
      user.role === "INSTRUCTOR" && user.instructorStatus === "APPROVED",
  );

  return children;
}

import { guardPage } from "@/lib/auth/auth-guard";

/** Instructors who are not (or no longer) approved. */
export default async function InstructorStatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardPage(
    (user) =>
      user.role === "INSTRUCTOR" && user.instructorStatus !== "APPROVED",
  );

  return children;
}

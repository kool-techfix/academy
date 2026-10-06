import { guardPage } from "@/lib/auth/auth-guard";

/** Only Google sign-ups that started from the instructor form. */
export default async function InstructorApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardPage(
    (user) => user.role === "LEARNER" && user.instructorApplicationStarted,
  );

  return children;
}

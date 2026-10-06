import { guardPage } from "@/lib/auth/auth-guard";

/** Learner course pages (catalog detail, lessons, quizzes, certificates). */
export default async function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardPage(
    (user) => user.role === "LEARNER" && !user.instructorApplicationStarted,
  );

  return children;
}

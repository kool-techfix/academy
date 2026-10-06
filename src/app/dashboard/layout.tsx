import { guardPage } from "@/lib/auth/auth-guard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardPage(
    (user) => user.role === "LEARNER" && !user.instructorApplicationStarted,
  );

  return children;
}

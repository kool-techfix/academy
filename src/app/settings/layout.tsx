import { guardPage } from "@/lib/auth/auth-guard";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardPage((user) => !user.instructorApplicationStarted);

  return children;
}

import { guardPage } from "@/lib/auth/auth-guard";

/**
 * Server-side gate for every /admin page. Data is also protected
 * independently: each /api/admin route calls requireAdmin().
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardPage((user) => user.role === "ADMIN");

  return children;
}

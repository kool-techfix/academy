import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/auth-guard";

/**
 * Server-side gate for every /admin page. Data is also protected
 * independently: each /api/admin route calls requireAdmin().
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect(user.role === "INSTRUCTOR" ? "/instructor" : "/dashboard");
  }

  return children;
}

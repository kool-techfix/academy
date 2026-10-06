import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/auth-guard";
import { homePathFor } from "@/lib/auth/redirects";

/** Landing page after Google sign-in: route the user by their role. */
export default async function ContinueAfterSignIn() {
  const user = await getCurrentUser();

  redirect(user ? homePathFor(user) : "/login");
}

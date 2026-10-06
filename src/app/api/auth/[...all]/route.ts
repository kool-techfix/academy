import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth/server";

// Better Auth endpoints, including the Google callback at
// /api/auth/callback/google. The static /api/auth/{login,logout,me} routes
// take precedence over this catch-all.
export const { GET, POST } = toNextJsHandler(auth);

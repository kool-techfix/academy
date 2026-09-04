import { cookies } from "next/headers";

import {
  SESSION_COOKIE_NAME,
  createSession,
} from "./session";

const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days

export async function setSessionCookie(
  userId: string,
  role: "LEARNER" | "INSTRUCTOR",
) {
  const token = await createSession({
    userId,
    role,
  });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
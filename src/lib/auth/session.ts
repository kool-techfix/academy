import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const AUTH_SECRET = process.env.AUTH_SECRET;

if (!AUTH_SECRET) {
  throw new Error("AUTH_SECRET is not configured");
}

const secret = new TextEncoder().encode(AUTH_SECRET);

export const SESSION_COOKIE_NAME = "academy_session";

const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = {
  userId: string;
  role: "LEARNER" | "INSTRUCTOR";
};

export async function createSession(
  payload: SessionPayload,
): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    role: payload.role,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(secret);
}

export async function verifySession(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);

    if (
      typeof payload.userId !== "string" ||
      (payload.role !== "LEARNER" &&
        payload.role !== "INSTRUCTOR")
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySession(token);
}
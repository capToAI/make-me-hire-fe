import { getToken } from "next-auth/jwt";
import { SignJWT } from "jose";

const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "make-my-resume-dev-secret-key-32chars";

const secretKey = new TextEncoder().encode(AUTH_SECRET);

export type BackendAuthResult =
  | { ok: true; headers: Record<string, string> }
  | { ok: false; status: number; error: string };

/**
 * Resolves the current NextAuth session server-side (decrypting the httpOnly
 * session cookie directly via getToken — never exposed to client-side JS via
 * useSession()/session callback) and mints a short-lived backend access token
 * signed with the same AUTH_SECRET the NestJS backend verifies.
 *
 * Replaces forwarding raw x-user-id/x-user-email identity headers, which the
 * backend previously trusted without any signature verification.
 */
export async function getBackendAuthHeaders(req: Request): Promise<BackendAuthResult> {
  const token = await getToken({ req, secret: AUTH_SECRET });

  if (!token?.dbUserId) {
    return { ok: false, status: 401, error: "Authentication required" };
  }

  const backendToken = await new SignJWT({ userId: token.dbUserId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(secretKey);

  return {
    ok: true,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${backendToken}`,
    },
  };
}

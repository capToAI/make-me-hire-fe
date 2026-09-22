import { jwtVerify } from 'jose';

const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  'make-my-resume-dev-secret-key-32chars';

const secretKey = new TextEncoder().encode(AUTH_SECRET);

export interface BackendTokenPayload {
  userId: number;
}

/**
 * Verifies a backend access token minted by the frontend's server-side auth
 * layer after a NextAuth login, sharing the same AUTH_SECRET/NEXTAUTH_SECRET.
 * Throws if the token is missing, malformed, expired, or has an invalid signature.
 */
export async function verifyBackendToken(token: string): Promise<BackendTokenPayload> {
  const { payload } = await jwtVerify(token, secretKey, { algorithms: ['HS256'] });

  const userId = Number(payload.userId);
  if (!userId || Number.isNaN(userId) || userId <= 0) {
    throw new Error('Invalid token payload: missing or invalid userId');
  }

  return { userId };
}

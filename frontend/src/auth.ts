import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const BACKEND_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
      clientSecret:
        process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.email) {
        try {
          const providerAccountId =
            account.providerAccountId ||
            (profile?.sub as string) ||
            user.id ||
            user.email;

          const response = await fetch(`${BACKEND_URL}/api/users/sync-google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name || (profile?.name as string) || null,
              image: user.image || (profile?.picture as string) || null,
              providerAccountId: String(providerAccountId),
            }),
            signal: AbortSignal.timeout(5000),
          });

          if (response.ok) {
            const dbUser = await response.json();
            if (dbUser?.id) {
              (user as { dbUserId?: number }).dbUserId = dbUser.id;
            }
          } else {
            console.warn(
              `Backend sync returned status ${response.status}: ${await response.text().catch(() => "")}`
            );
          }
        } catch (err: unknown) {
          // Graceful fallback: do not break login if backend is temporarily offline
          console.error(
            "Notice: Could not sync user with backend Postgres service:",
            err instanceof Error ? err.message : String(err)
          );
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        const dbUserId = (user as { dbUserId?: number }).dbUserId;
        if (dbUserId) {
          token.dbUserId = dbUserId;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session?.user) {
        if (token.dbUserId) {
          session.user.id = String(token.dbUserId);
        } else if (token.sub) {
          session.user.id = token.sub;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "make-my-resume-dev-secret-key-32chars",
});

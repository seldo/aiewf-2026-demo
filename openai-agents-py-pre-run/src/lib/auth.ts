import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// INSECURE DEMO AUTH — local demo only.
// Twitter/X OAuth has been replaced with a credentials provider that logs
// everyone in as the same fixed demo user with no password check. Do NOT use
// this anywhere real.
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Demo",
      credentials: {},
      async authorize() {
        // Always succeeds — returns a fixed demo user.
        return {
          id: "demo-user",
          name: "Demo Shopper",
          email: "demo@wondertoys.local",
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

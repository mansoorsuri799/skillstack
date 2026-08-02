import type { NextAuthConfig } from "next-auth";

/** 30 days — kept in sync with the full config in src/auth.ts */
const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

/**
 * Edge-compatible NextAuth config.
 * Must NOT import Node.js-only modules (bcrypt, mongoose, …).
 * Used by src/middleware.ts to validate JWT cookies on the Edge runtime.
 * The full config (with Credentials + Google providers and DB calls) lives in src/auth.ts.
 */
const authConfig: NextAuthConfig = {
  providers: [],

  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
    updateAge: 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
    error: "/auth/error",
  },

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name ?? token.name;
        token.email = user.email ?? token.email;
        token.picture = user.image ?? token.picture;
      }
      return token;
    },

    session({ session, token }) {
      if (session.user) {
        if (token.id) session.user.id = token.id as string;
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email;
        if (token.picture) session.user.image = token.picture as string;
      }
      return session;
    },
  },

  trustHost: true,
};

export default authConfig;

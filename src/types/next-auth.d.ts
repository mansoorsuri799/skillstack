import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      /** MongoDB ObjectId string. Present on every authenticated session. */
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /** MongoDB ObjectId string, written at sign-in. */
    id?: string;
    /** Stable claims kept in the JWT to avoid DB lookups per request. */
    name?: string | null;
    email?: string | null;
    picture?: string | null;
  }
}

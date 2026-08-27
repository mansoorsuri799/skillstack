import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import authConfig from "@/auth.config";

class EmailNotVerifiedError extends CredentialsSignin {
  code = "EMAIL_NOT_VERIFIED";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (
          typeof email !== "string" ||
          typeof password !== "string" ||
          !email ||
          !password
        ) {
          return null;
        }

        await connectDB();
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user || !user.password) return null;

        if (!user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image ?? undefined,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.name = user.name ?? token.name;
        token.email = user.email ?? token.email;
        token.picture = user.image ?? token.picture;
      } else if (!token.id && typeof token.email === "string") {
        // Backfill MongoDB id for sessions created before jwt callback was wired.
        await connectDB();
        const dbUser = await User.findOne({
          email: token.email.toLowerCase().trim(),
        });
        if (dbUser) token.id = dbUser._id.toString();
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

    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;

      try {
        const email =
          typeof user.email === "string"
            ? user.email.toLowerCase().trim()
            : "";
        if (!email) {
          console.error("[auth] Google sign-in missing email");
          return "/auth/error?error=NoEmail";
        }

        if (!process.env.MONGODB_URI) {
          console.error("[auth] MONGODB_URI is not set in this environment");
          return "/auth/error?error=Database";
        }

        await connectDB();

        let dbUser = await User.findOne({ email });

        if (!dbUser) {
          dbUser = await User.create({
            name: user.name?.trim() || "SkillStack user",
            email,
            password: undefined,
            emailVerified: new Date(),
            googleId: account.providerAccountId,
            image: user.image ?? undefined,
          });
        } else {
          dbUser.googleId = account.providerAccountId;
          dbUser.emailVerified = dbUser.emailVerified ?? new Date();
          if (user.image) dbUser.image = user.image;
          if (user.name?.trim()) dbUser.name = user.name.trim();
          await dbUser.save();
        }

        user.id = dbUser._id.toString();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[auth] Google sign-in failed:", message, err);
        if (
          /MONGODB_URI|buffering timed out|ECONNREFUSED|ENOTFOUND|authentication failed|bad auth|MongoServerError|MongoNetworkError|E11000|duplicate key/i.test(
            message,
          )
        ) {
          return "/auth/error?error=Database";
        }
        return "/auth/error?error=AccessDenied";
      }
    },
  },
});

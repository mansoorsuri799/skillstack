import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Please enter your full name." },
        { status: 400 },
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing?.googleId && !existing.password) {
      return NextResponse.json(
        {
          error:
            "This email is already signed up with Google. Use Continue with Google.",
        },
        { status: 409 },
      );
    }
    if (existing?.emailVerified) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (existing && !existing.emailVerified) {
      existing.name = name;
      existing.password = hashed;
      existing.verificationToken = verificationToken;
      existing.verificationTokenExpires = verificationTokenExpires;
      await existing.save();
    } else {
      await User.create({
        name,
        email,
        password: hashed,
        emailVerified: null,
        verificationToken,
        verificationTokenExpires,
      });
    }

    try {
      await sendVerificationEmail({ to: email, name, token: verificationToken });
    } catch (mailError) {
      console.error("Verification email failed:", mailError);
      return NextResponse.json(
        {
          error:
            "Account created, but we could not send the verification email. Check SMTP settings.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Check your email to verify your account before signing in.",
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

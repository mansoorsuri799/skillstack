import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mail";
import { User } from "@/models/User";

const GENERIC_OK =
  "If an account exists for that email, we sent a password reset link.";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email =
      typeof body.email === "string" ? body.email.toLowerCase().trim() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await User.findOne({ email });

    // Always return the same message to avoid email enumeration.
    if (!user) {
      return NextResponse.json({ ok: true, message: GENERIC_OK });
    }

    // Google-only accounts have no password to reset.
    if (!user.password) {
      return NextResponse.json({
        ok: true,
        message:
          "This account uses Google sign-in. Continue with Google on the login page instead.",
        googleOnly: true,
      });
    }

    const resetPasswordToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordTokenExpires = resetPasswordTokenExpires;
    await user.save();

    try {
      await sendPasswordResetEmail({
        to: email,
        name: user.name,
        token: resetPasswordToken,
      });
    } catch (mailError) {
      const baseUrl =
        process.env.AUTH_URL ||
        process.env.NEXTAUTH_URL ||
        "http://localhost:3000";
      const directResetUrl = `${baseUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(resetPasswordToken)}`;
      console.error("Password reset email failed:", mailError);
      console.log(`\n[DEV LINK] Direct Password Reset URL:\n${directResetUrl}\n`);

      return NextResponse.json(
        {
          error:
            "We could not send the reset email. Check SMTP settings and try again.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, message: GENERIC_OK });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
